const creditSalesService = require("../services/credit-sales.service");

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

// ─── Parties ──────────────────────────────────────────────────

const listParties = respond((request) =>
  creditSalesService.listParties(request.auth.orgId, request.query.includeInactive));

const getPartyBalances = respond((request) =>
  creditSalesService.getPartyBalances(request.auth.orgId));

const getParty = respond((request) =>
  creditSalesService.findParty(request.auth.orgId, request.params.id));

const createParty = respond((request) =>
  creditSalesService.createParty(request.auth.orgId, request.auth.memberId, request.body), 201);

const updateParty = respond((request) =>
  creditSalesService.updateParty(request.auth.orgId, request.params.id, request.body));

const deleteParty = respond((request) =>
  creditSalesService.deleteParty(request.auth.orgId, request.params.id));

// ─── Rates ────────────────────────────────────────────────────

const upsertRate = respond((request) =>
  creditSalesService.upsertRate(request.auth.orgId, request.params.partyId, request.body), 201);

const deleteRate = respond((request) =>
  creditSalesService.deleteRate(request.auth.orgId, request.params.rateId));

// ─── Transactions ───────────────────────────────────────────

const listTransactions = respond((request) =>
  creditSalesService.listTransactions(request.auth.orgId, request.query));

const createTransaction = respond((request) =>
  creditSalesService.createTransaction(request.auth.orgId, request.auth.memberId, request.body), 201);

const deleteTransaction = respond((request) =>
  creditSalesService.deleteTransaction(request.auth.orgId, request.params.id));

module.exports = {
  listParties,
  getPartyBalances,
  getParty,
  createParty,
  updateParty,
  deleteParty,
  upsertRate,
  deleteRate,
  listTransactions,
  createTransaction,
  deleteTransaction,
};
