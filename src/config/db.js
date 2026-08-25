const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const { withAccelerate } = require("@prisma/extension-accelerate");
const { env } = require("./env");

/*
 * Two ways to reach the database:
 *
 *   - Accelerate: PRISMA_ACCELERATE holds a `prisma://` (or
 *     `prisma+postgres://`) URL issued by the Prisma console. Queries go
 *     through Accelerate's pooler and cache; no local driver is involved.
 *   - Direct MySQL: DATABASE_URL holds a `mysql://` URL. Prisma 7 requires a
 *     driver adapter for direct connections, which is the MariaDB adapter —
 *     it speaks the MySQL wire protocol and serves both.
 *
 * Only a genuine Accelerate scheme selects the first path. A pooled
 * `postgres://` string is NOT an Accelerate URL, so it correctly falls
 * through rather than being handed to the Accelerate client.
 */
const accelerateUrl = env.PRISMA_ACCELERATE_URL;
const isAccelerateUrl =
  accelerateUrl?.startsWith("prisma+postgres://") || accelerateUrl?.startsWith("prisma://");

/*
 * Splits a `mysql://user:pass@host:port/database` URL into the discrete
 * options the adapter expects. Values are percent-decoded, so passwords
 * containing `@`, `/`, or `#` survive the round trip.
 */
const parseMysqlUrl = (databaseUrl) => {
  const url = new URL(databaseUrl);
  const ssl = url.searchParams.get("sslaccept") === "strict" ||
    url.searchParams.get("ssl") === "true";

  return {
    host: decodeURIComponent(url.hostname),
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    ...(ssl ? { ssl: {} } : {}),
  };
};

// Query logging is attached via `$on` before `$extends`, because the extended
// client returned by `$extends` no longer exposes `$on`. Left off in production
// so it does not log a line per query on every request.
const logQueries = env.NODE_ENV !== "production";

const buildClient = () => {
  if (isAccelerateUrl) {
    return new PrismaClient({
      ...(logQueries ? { log: [{ emit: "event", level: "query" }] } : {}),
      accelerateUrl,
    });
  }

  // The adapter owns the connection pool. `connectionLimit` is modest because
  // each Node process keeps its own pool; cPanel/shared MySQL hosts cap the
  // total connections per user quite low.
  //
  // The URL is expanded into discrete fields rather than passed as `url`:
  // the adapter's URL parser does not handle every valid MySQL URL (an empty
  // password, as XAMPP's default root account uses, yields a pool that never
  // connects), whereas explicit options are unambiguous.
  const adapter = new PrismaMariaDb({
    ...parseMysqlUrl(env.DATABASE_URL),
    connectionLimit: 5,
  });

  return new PrismaClient({
    ...(logQueries ? { log: [{ emit: "event", level: "query" }] } : {}),
    adapter,
  });
};

const baseClient = buildClient();

if (logQueries && !isAccelerateUrl) {
  // `event.duration` is the engine's own execution time. Over Accelerate the
  // query runs remotely and this is always reported as 0, so the event log is
  // only meaningful on a direct connection.
  baseClient.$on("query", (event) => {
    console.log(`[db] ${event.duration}ms ${event.query}`);
  });
}

const prisma = isAccelerateUrl ? baseClient.$extends(withAccelerate()) : baseClient;

// Over Accelerate, measure the real client-observed round trip instead, and
// surface the cache status so hits and misses are distinguishable.
const loggedPrisma =
  logQueries && isAccelerateUrl
    ? prisma.$extends({
        query: {
          async $allOperations({ model, operation, args, query }) {
            const started = Date.now();
            const result = await query(args);
            const cacheStatus = args?.cacheStrategy ? "" : " (uncached)";
            console.log(
              `[db] ${Date.now() - started}ms ${model ?? "raw"}.${operation}${cacheStatus}`,
            );
            return result;
          },
        },
      })
    : prisma;

module.exports = loggedPrisma;
