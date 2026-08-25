const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/credit-sales.controller");
const {
  validateCreateParty,
  validateUpdateParty,
  validateUpsertRate,
  validateCreateTransaction,
  validateListPartiesQuery,
  validateListTransactionsQuery,
} = require("../validator/credit-sales.validator");

const router = express.Router();

const requireAdmin = (request, _response, next) =>
  request.auth.role === "ADMIN" ? next() : next(new AppError(403, "You do not have permission to manage credit parties."));

router.use(authenticate);

// Parties — all roles can read (needed for credit sale entry dropdowns), ADMIN only can write
router.get("/credit-party/parties/balances", controller.getPartyBalances);
router.get("/credit-party/parties", validateListPartiesQuery, controller.listParties);
router.post("/credit-party/parties", requireAdmin, validateCreateParty, controller.createParty);
router.get("/credit-party/parties/:id", controller.getParty);
router.put("/credit-party/parties/:id", requireAdmin, validateUpdateParty, controller.updateParty);
router.delete("/credit-party/parties/:id", requireAdmin, controller.deleteParty);

// Rates — all roles can read (embedded in party), ADMIN only can write
router.post("/credit-party/parties/:partyId/rates", requireAdmin, validateUpsertRate, controller.upsertRate);
router.delete("/credit-party/parties/rates/:rateId", requireAdmin, controller.deleteRate);

// Transactions — all authenticated roles can read/create/delete (daily credit entry flow)
router.get("/credit-party/transactions", validateListTransactionsQuery, controller.listTransactions);
router.post("/credit-party/transactions", validateCreateTransaction, controller.createTransaction);
router.delete("/credit-party/transactions/:id", controller.deleteTransaction);

module.exports = router;
