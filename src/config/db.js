const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const { env } = require("./env");

/*
 * The app connects straight to MySQL: DATABASE_URL holds a `mysql://` URL.
 * Prisma 7 requires a driver adapter for direct connections, which is the
 * MariaDB adapter -- it speaks the MySQL wire protocol and serves both.
 */

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

// Left off in production so it does not log a line per query on every request.
const logQueries = env.NODE_ENV !== "production";

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

const prisma = new PrismaClient({
  ...(logQueries ? { log: [{ emit: "event", level: "query" }] } : {}),
  adapter,
});

if (logQueries) {
  // `event.duration` is the engine's own execution time.
  prisma.$on("query", (event) => {
    console.log(`[db] ${event.duration}ms ${event.query}`);
  });
}

module.exports = prisma;
