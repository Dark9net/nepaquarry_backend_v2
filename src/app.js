const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { env } = require("./config/env");
const { AppError } = require("./lib/error");
const { verifyTrustedOrigin } = require("./middleware/csrf");
const authRoutes = require("./routes/auth.routes");
const staffRoutes = require("./routes/staff.routes");
const staffManagementRoutes = require("./routes/staff-management.routes");
const advancedStaffManagementRoutes = require("./routes/advanced_staff-management.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const plantRoutes = require("./routes/plant.routes");
const productRoutes = require("./routes/product.routes");
const materialRoutes = require("./routes/material.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const ordersRoutes = require("./routes/orders.routes");
const usersRoutes = require("./routes/users.routes");
const purchaseRoutes = require("./routes/purchase.routes");
const purchaseSuppliersRoutes = require("./routes/purchaseSuppliers.routes");
const maintenanceShopRoutes = require("./routes/maintenanceshop.routes");
const rawMaterialTripEntryRoutes = require("./routes/raw-material-trip-entry.routes");
const plantReportRoutes = require("./routes/plant-report.routes");
const vehicleMaintenanceRoutes = require("./routes/vehicle-maintenance.routes");
const rateManagementRoutes = require("./routes/rate-management.routes");
const salesRoutes = require("./routes/sales.routes");
const creditSalesRoutes = require("./routes/credit-sales.routes");
const teamRoutes = require("./routes/team.routes");
const orgSettingsRoutes = require("./routes/org-settings.routes");
const importRoutes = require("./routes/import.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const { uploadRoot } = require("./middleware/staffUploads");

const app = express();

// Required when TLS terminates at a reverse proxy so secure cookies work and
// express-rate-limit can key on the real client IP from X-Forwarded-For.
// Driven by TRUST_PROXY rather than NODE_ENV: being behind a proxy is a
// property of the deployment, not of the build mode.
if (env.TRUST_PROXY > 0) {
  app.set("trust proxy", env.TRUST_PROXY);
}

app.disable("x-powered-by");

const normalizeOrigin = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    return new URL(value.trim()).origin;
  } catch {
    return value.trim().replace(/\/$/, "");
  }
};

const allowedOrigins = new Set([
  normalizeOrigin(env.FRONTEND_URL)
].filter(Boolean));

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (normalizedOrigin && allowedOrigins.has(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    callback(new AppError(403, "Request origin is not allowed"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(express.json({ limit: "10kb", strict: true }));
app.use(verifyTrustedOrigin);

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "NepaQuarry Service is Running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
// Public storefront routes (plan listing, checkout) — mounted before the
// authenticated `/api`-prefixed routers below, each of which applies
// `authenticate` to every request that reaches it via an unconditional
// `router.use(authenticate)`. Express tries same-prefix routers in mount
// order, so an authenticated router registered first would otherwise
// intercept and reject these public requests before they ever reach here.
app.use("/api", subscriptionRoutes);
app.use("/api/assets", staffRoutes);
app.use("/api/assets/staff", staffManagementRoutes);
app.use("/api/assets/staff", advancedStaffManagementRoutes);
app.use("/api/assets", vehicleRoutes);
app.use("/api/assets", plantRoutes);
app.use("/api/assets", productRoutes);
app.use("/api/assets", materialRoutes);
app.use("/api/assets", inventoryRoutes);
app.use("/api/assets", ordersRoutes);
app.use("/api/assets", usersRoutes);
app.use("/api", purchaseRoutes);
app.use("/api", purchaseSuppliersRoutes);
app.use("/api", maintenanceShopRoutes);
app.use("/api", rawMaterialTripEntryRoutes);
app.use("/api", plantReportRoutes);
app.use("/api", vehicleMaintenanceRoutes);
app.use("/api", rateManagementRoutes);
app.use("/api", salesRoutes);
app.use("/api", creditSalesRoutes);
app.use("/api", teamRoutes);
app.use("/api", orgSettingsRoutes);
app.use("/api/import", importRoutes);
app.use("/uploads", express.static(uploadRoot));

app.use((error, _request, response, _next) => {
  if (response.headersSent) {
    return;
  }

  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;

  // Unexpected failures are reported to the client as a bare "Internal server
  // error", so without this the real cause is lost entirely.
  if (statusCode >= 500) {
    console.error("[error]", _request?.method, _request?.originalUrl, error);
  }

  response.status(statusCode).json({
    message: statusCode >= 500 ? "Internal server error" : error.message,
    issues: statusCode < 500 ? error.issues || undefined : undefined,
    // Lets the client tell a device-limit rejection apart from an ordinary
    // 403 and show the "sign out from another device" prompt, listing which
    // devices currently hold the org's seats.
    // A subscription rejection also carries a stable code, so the client can
    // recognise it without matching on the message text (the wording differs
    // per status and would silently stop matching if reworded).
    code: error.deviceLimitReached
      ? "DEVICE_LIMIT_REACHED"
      : error.subscriptionExpired
        ? "SUBSCRIPTION_INACTIVE"
        : undefined,
    subscriptionStatus: error.subscriptionExpired ? error.subscriptionStatus : undefined,
    deviceLimit: error.deviceLimitReached ? error.deviceLimit : undefined,
    activeSessions: error.deviceLimitReached ? error.activeSessions : undefined,
  });
});

module.exports = app;
