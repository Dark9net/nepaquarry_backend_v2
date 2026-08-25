const prisma = require("../config/db");
const { AppError } = require("../lib/error");
const { removeStoredSlip } = require("../middleware/advancedStaffManagementUploads");

const advanceInclude = {
  staff:                { select: { id: true, fullName: true, employeeCode: true } },
  createdBy:            { include: { user: { select: { name: true } } } },
  approvedBy:           { include: { user: { select: { name: true } } } },
  additionalApprovedBy: { include: { user: { select: { name: true } } } },
  dailyExpenses:        { select: { id: true } },
};

const notFound = (resource) => new AppError(404, `${resource} not found`);

// The DailyExpense table has a single `advanceId` link with no main/additional
// slot column, so any linked expense locks both slip slots for this advance.
const withExpenseLock = (advance) => {
  const { dailyExpenses, ...rest } = advance;
  const used = dailyExpenses.length > 0;
  return { ...rest, usedInMainExpense: used, usedInAdditionalExpense: used };
};

const assertStaff = async (orgId, staffId) => {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, orgId, deletedAt: null } });
  if (!staff) throw new AppError(400, "Select an active staff member in your organization.");
  return staff;
};

const buildAdvanceWhere = (orgId, { staffId, month, year }) => {
  const where = { orgId };
  if (staffId) where.staffId = staffId;
  if (month) where.advanceMonth = month;
  if (year) where.advanceYear = year;
  return where;
};

const listAdvances = async (orgId, filters, pagination) => {
  const where = buildAdvanceWhere(orgId, filters);
  const orderBy = [{ advanceYear: "desc" }, { advanceMonth: "desc" }, { createdAt: "desc" }];

  if (!pagination) {
    const rows = await prisma.advance.findMany({ where, include: advanceInclude, orderBy });
    return rows.map(withExpenseLock);
  }

  const { page, limit } = pagination;
  const [total, rows] = await prisma.$transaction([
    prisma.advance.count({ where }),
    prisma.advance.findMany({ where, include: advanceInclude, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);
  return { data: rows.map(withExpenseLock), total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

const createAdvance = async ({ orgId, memberId, data }) => {
  await assertStaff(orgId, data.staffId);

  try {
    const created = await prisma.advance.create({
      data: {
        orgId,
        staffId:      data.staffId,
        createdById:  memberId,
        advanceMonth: data.advanceMonth,
        advanceYear:  data.advanceYear,
        amount:       data.amount,
        reason:       data.reason,
        paymentMethod: data.paymentMethod ?? "CASH",
        chequeDetails: data.chequeDetails ?? null,
        chequeamount:  data.chequeamount ?? null,
      },
      include: advanceInclude,
    });
    return withExpenseLock(created);
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError(400, "This staff member already has an advance request for that month.");
    }
    throw error;
  }
};

const reviewAdvance = async ({ orgId, memberId, id, data }) => {
  const advance = await prisma.advance.findFirst({ where: { id, orgId } });
  if (!advance) throw notFound("Advance request");
  if (advance.status !== "PENDING") throw new AppError(400, "Only pending advance requests can be reviewed.");

  const updated = await prisma.advance.update({
    where: { id },
    data: {
      status:       data.status,
      approvedById: memberId,
      approvedAt:   new Date(),
    },
    include: advanceInclude,
  });
  return withExpenseLock(updated);
};

const requestAdditional = async ({ orgId, id, data }) => {
  const advance = await prisma.advance.findFirst({ where: { id, orgId } });
  if (!advance) throw notFound("Advance request");
  if (advance.status !== "APPROVED") throw new AppError(400, "The primary advance must be approved before requesting an additional advance.");
  if (advance.additionalAmount !== null) throw new AppError(400, "An additional advance has already been requested for this record.");

  const updated = await prisma.advance.update({
    where: { id },
    data: {
      additionalAmount:      data.additionalAmount,
      additionalReason:      data.additionalReason,
      additionalStatus:      "PENDING",
      additionalRequestedAt: new Date(),
      additionalPaymentMethod: data.additionalPaymentMethod ?? "CASH",
      additionalChequeDetails: data.additionalChequeDetails ?? null,
      additionalChequeamount:  data.additionalChequeamount ?? null,
    },
    include: advanceInclude,
  });
  return withExpenseLock(updated);
};

const reviewAdditional = async ({ orgId, memberId, id, data }) => {
  const advance = await prisma.advance.findFirst({ where: { id, orgId } });
  if (!advance) throw notFound("Advance request");
  if (advance.additionalStatus !== "PENDING") throw new AppError(400, "Only a pending additional advance can be reviewed.");

  const updated = await prisma.advance.update({
    where: { id },
    data: {
      additionalStatus:       data.status,
      additionalApprovedById: memberId,
      additionalApprovedAt:   new Date(),
    },
    include: advanceInclude,
  });
  return withExpenseLock(updated);
};

const submitTakenDate = async ({ orgId, id, data }) => {
  const advance = await prisma.advance.findFirst({ where: { id, orgId } });
  if (!advance) throw notFound("Advance request");

  if (data.slot === "additional") {
    if (advance.additionalStatus !== "APPROVED") throw new AppError(400, "The additional advance must be approved first.");
    const updated = await prisma.advance.update({
      where: { id },
      data: { additionalAdvanceTakenDate: data.takenDate },
      include: advanceInclude,
    });
    return withExpenseLock(updated);
  }

  if (advance.status !== "APPROVED") throw new AppError(400, "The advance must be approved first.");
  const updated = await prisma.advance.update({
    where: { id },
    data: { advanceTakenDate: data.takenDate },
    include: advanceInclude,
  });
  return withExpenseLock(updated);
};

const uploadSlip = async ({ orgId, id, slot, slipUrl }) => {
  const advance = await prisma.advance.findFirst({ where: { id, orgId } });
  if (!advance) throw notFound("Advance request");
  if (!slipUrl) throw new AppError(400, "A slip file is required.");

  const field = slot === "additional" ? "additionalPaymentSlipUrl" : "paymentSlipUrl";
  const previousUrl = advance[field];

  const updated = await prisma.advance.update({
    where: { id },
    data: { [field]: slipUrl },
    include: advanceInclude,
  });

  if (previousUrl && previousUrl !== slipUrl) {
    removeStoredSlip(previousUrl);
  }

  return withExpenseLock(updated);
};

module.exports = {
  listAdvances,
  createAdvance,
  reviewAdvance,
  requestAdditional,
  reviewAdditional,
  submitTakenDate,
  uploadSlip,
};
