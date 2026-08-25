const orgSettingsService = require("../services/org-settings.service");

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

const parsePagination = (query) => {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);
  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) return null;
  return { page, limit: Math.min(limit, 100) };
};

const getSettings = respond((request) => orgSettingsService.getOrgSettings(request.auth.orgId));

const updateSettings = respond((request) =>
  orgSettingsService.updateOrgSettings(request.auth.orgId, request.body));

const listUserActivityLogs = respond((request) =>
  orgSettingsService.listUserActivityLogs(
    request.auth.orgId,
    { from: request.query.from, to: request.query.to },
    parsePagination(request.query)
  ));

module.exports = { getSettings, updateSettings, listUserActivityLogs };
