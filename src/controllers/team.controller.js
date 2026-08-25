const teamService = require("../services/team.service");

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

const listMembers = respond((request) =>
  teamService.listMembers(request.auth.orgId, request.query));

const inviteMember = respond((request) =>
  teamService.inviteMember(request.auth.orgId, request.body), 201);

const updateStatus = respond((request) =>
  teamService.setMemberStatus(request.auth.orgId, request.params.id, request.body.isActive));

const updateRole = respond((request) =>
  teamService.setMemberRole(request.auth.orgId, request.params.id, request.body.role));

const changePassword = respond((request) =>
  teamService.changeOwnPassword(request.auth.sub, request.body.currentPassword, request.body.newPassword));

module.exports = {
  listMembers,
  inviteMember,
  updateStatus,
  updateRole,
  changePassword,
};
