const usersService = require("../services/users.service");

const respond = (handler, status = 200) => async (request, response, next) => {
  try { response.status(status).json({ data: await handler(request) }); } catch (error) { next(error); }
};

const listSupervisors = respond((request) => usersService.listSupervisors(request.auth.orgId));

module.exports = { listSupervisors };
