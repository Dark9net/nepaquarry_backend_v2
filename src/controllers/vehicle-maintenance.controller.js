const maintenanceService = require("../services/vehicle-maintenance.service");
const { storedVoucherPaths } = require("../middleware/maintenanceUploads");
const { AppError } = require("../lib/error");

const respond = (handler, status = 200) => async (request, response, next) => {
  try {
    const result = await handler(request);
    if (result && typeof result === "object" && "success" in result) {
      response.status(status).json(result);
      return;
    }
    response.status(status).json({ data: result });
  } catch (error) {
    next(error);
  }
};

// Returns { page, limit } only when both are valid positive integers; otherwise null (full list).
const parsePagination = (query) => {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);
  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) return null;
  return { page, limit: Math.min(limit, 100) };
};

const parseFilters = (query) => ({
  month: query.month ? Number.parseInt(query.month, 10) : undefined,
  year: query.year ? Number.parseInt(query.year, 10) : undefined,
  vehicleId: query.vehicleId || undefined,
  plantId: query.plantId || undefined,
  status: query.status || undefined,
  paymentStatus: query.paymentStatus || undefined,
});

const listMaintenance = respond((request) =>
  maintenanceService.listMaintenance(request.auth.orgId, parseFilters(request.query), parsePagination(request.query)));

const getMaintenance = respond((request) => maintenanceService.findMaintenance(request.auth.orgId, request.params.id));

const createMaintenance = respond((request) => maintenanceService.createMaintenance({
  orgId: request.auth.orgId,
  memberId: request.auth.memberId,
  data: request.body,
}), 201);

const updateMaintenance = respond((request) => maintenanceService.updateMaintenance({
  orgId: request.auth.orgId,
  id: request.params.id,
  data: request.body,
}));

const uploadVouchers = respond((request) => {
  let keepPhotos = [];
  try {
    keepPhotos = JSON.parse(request.body.keepPhotos || "[]");
    if (!Array.isArray(keepPhotos) || !keepPhotos.every((value) => typeof value === "string")) throw new Error("invalid");
  } catch {
    throw new AppError(400, "keepPhotos must be a JSON array of strings.");
  }

  return maintenanceService.uploadVouchers({
    orgId: request.auth.orgId,
    id: request.params.id,
    keepPhotos,
    newPhotoPaths: storedVoucherPaths(request.files),
  });
});

const reviewMaintenance = respond((request) => maintenanceService.reviewMaintenance({
  orgId: request.auth.orgId,
  memberId: request.auth.memberId,
  id: request.params.id,
  reviewNote: request.body.reviewNote,
}));

const deleteMaintenance = respond((request) => maintenanceService.deleteMaintenance(request.auth.orgId, request.params.id));

const stats = respond((request) => maintenanceService.stats(request.auth.orgId, {
  month: request.query.month ? Number.parseInt(request.query.month, 10) : undefined,
  year: request.query.year ? Number.parseInt(request.query.year, 10) : undefined,
}));

module.exports = {
  listMaintenance,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  uploadVouchers,
  reviewMaintenance,
  deleteMaintenance,
  stats,
};
