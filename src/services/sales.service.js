const prisma = require("../config/db");
const { AppError } = require("../lib/error");
const { Decimal } = require("decimal.js");
const { adToBS, formatNepaliDate } = require("../utils/nepaliDate");

// Keep adToBs as a re-export so the controller import doesn't break
const adToBs = adToBS;

// ─── Bill number generator ────────────────────────────────────
// Format: YYYYMMDD-XXXX where XXXX = random 4-char alphanumeric

async function generateBillNumber(orgId, date) {
  const d = new Date(date);
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let bill;
  let attempts = 0;
  do {
    const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    bill = `${ymd}-${suffix}`;
    attempts++;
    if (attempts > 20) throw new AppError(500, "Could not generate unique bill number");
  } while (await prisma.dailySalesReport.findUnique({ where: { billNumber: bill } }));
  return bill;
}

function toInputDate(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function kathmanduTodayInputDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function addUtcDays(date, days) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

async function getNextAllowedReportDate(orgId) {
  const latest = await prisma.dailySalesReport.findFirst({
    where: { orgId },
    orderBy: { date: "desc" },
    select: { date: true, billNumber: true },
  });

  if (!latest) return { latest: null, nextAllowedDate: null };
  return { latest, nextAllowedDate: addUtcDays(latest.date, 1) };
}

async function getReportSequenceBlock(orgId, date) {
  const { latest, nextAllowedDate } = await getNextAllowedReportDate(orgId);
  if (!latest || !nextAllowedDate || date.getTime() === nextAllowedDate.getTime()) return null;

  const nextAllowedDateStr = toInputDate(nextAllowedDate);
  const latestDateStr = toInputDate(latest.date);
  return {
    latestDate: latestDateStr,
    latestBillNumber: latest.billNumber,
    nextAllowedDate: nextAllowedDateStr,
    message: `Please submit the previous day report first. The next allowed daily sales report is ${nextAllowedDateStr}. If there were no transactions that day, submit it as a no records report with zero values.`,
  };
}

async function assertReportSequence(orgId, date) {
  const block = await getReportSequenceBlock(orgId, date);
  if (block) throw new AppError(400, block.message);
}

function assertReportDateIsClosed(dateStr) {
  if (dateStr >= kathmanduTodayInputDate()) {
    throw new AppError(
      400,
      "Today's Daily Sales report can only be submitted after 12:00 midnight, when it becomes tomorrow.",
    );
  }
}

// ─── Shared include ───────────────────────────────────────────

const reportInclude = {
  createdBy: { select: { id: true, user: { select: { name: true } } } },
  approvedBy: { select: { id: true, user: { select: { name: true } } } },
  expenses: {
    include: {
      staff: { select: { id: true, fullName: true, employeeCode: true } },
      maintenance: {
        select: {
          id: true,
          maintenanceDate: true,
          vehicle: { select: { VehicleModel: true, vehicleNo: true } },
          plant: { select: { name: true, location: true } },
        },
      },
      advance: { select: { id: true, advanceMonth: true, advanceYear: true, advanceTakenDate: true, additionalAdvanceTakenDate: true } },
      purchase: { select: { id: true, serialNo: true, particular: true, billNo: true } },
    },
    orderBy: { type: "asc" },
  },
  bankDeposits: {
    orderBy: { party: "asc" },
  },
  sales: {
    include: {
      material: { select: { id: true, name: true } },
      tripVehicle: { select: { id: true, vehicleModel: true, volume: true } },
    },
    orderBy: { material: { name: "asc" } },
  },
  saleEntries: {
    include: {
      material: { select: { id: true, name: true } },
      tripVehicle: { select: { id: true, vehicleModel: true, volume: true } },
      createdBy: { select: { id: true, user: { select: { name: true } } } },
    },
    orderBy: [{ createdAt: "asc" }],
  },
  creditSales: {
    orderBy: { partyName: "asc" },
  },
  salesReturns: {
    include: {
      createdBy: { select: { id: true, user: { select: { name: true } } } },
    },
    orderBy: [{ createdAt: "asc" }],
  },
  creditTransactions: {
    include: {
      creditParty: { select: { id: true, name: true, balanceType: true } },
      tripVehicle: { select: { id: true, vehicleModel: true, volume: true } },
      material: { select: { id: true, name: true } },
      createdBy: { select: { id: true, user: { select: { name: true } } } },
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  },
};

// ─── Auto-pull today's maintenance + advance expenses ─────────

async function pullAutoExpenses(orgId, date) {
  const startOfDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  const maintenances = await prisma.vehicleMaintenance.findMany({
    where: { orgId, paymentDate: startOfDay },
    include: {
      vehicle: { select: { VehicleModel: true, vehicleNo: true } },
      plant: { select: { name: true, location: true } },
    },
  });

  const advances = await prisma.advance.findMany({
    where: {
      orgId,
      status: "APPROVED",
      advanceTakenDate: startOfDay,
    },
    include: { staff: { select: { id: true, fullName: true } } },
  });

  const additionalAdvances = await prisma.advance.findMany({
    where: {
      orgId,
      additionalStatus: "APPROVED",
      additionalAdvanceTakenDate: startOfDay,
    },
    include: { staff: { select: { id: true, fullName: true } } },
  });

  /*
   * Cash paid to maintenance shops on this date. Only CASH counts — a cheque
   * does not leave the counter, so it is not a cash expense (this mirrors the
   * `CASH_IN_COUNTER` filter applied to purchase payments below).
   *
   * These are the amounts actually handed over, whereas the `maintenances`
   * query above reports a record's whole `totalCost` on its payment date. For
   * any record that has shop payments on this date the payments are the
   * truthful figure, so the totalCost row is suppressed for it further down —
   * otherwise the same money would appear twice.
   */
  const maintenanceShopPayments = await prisma.maintenanceShopPayment.findMany({
    where: { orgId, paymentDate: startOfDay, paymentMethod: "CASH" },
    include: {
      shop: { select: { name: true } },
      maintenance: {
        select: {
          id: true,
          vehicle: { select: { VehicleModel: true, vehicleNo: true } },
          plant: { select: { name: true, location: true } },
        },
      },
    },
    orderBy: [{ paymentDate: "asc" }, { createdAt: "asc" }],
  });

  const purchasePayments = await prisma.purchaseSupplierPayment.findMany({
    where: {
      orgId,
      paymentDate: startOfDay,
      paymentMethod: "CASH_IN_COUNTER",
    },
    include: {
      purchase: { select: { id: true, serialNo: true, billNo: true, particular: true, partyName: true } },
      supplier: { select: { name: true } },
    },
    orderBy: [{ paymentDate: "asc" }, { createdAt: "asc" }],
  });

  const expenses = [];

  // Names the vehicle or plant a maintenance record belongs to. Shared by the
  // totalCost rows and the shop-payment rows so both read identically.
  const assetNameOf = (record) => {
    if (!record) return null;
    if (record.plant) {
      return record.plant.location
        ? `${record.plant.name} (${record.plant.location})`
        : record.plant.name;
    }
    return `${record.vehicle?.VehicleModel || "Unknown vehicle"}${
      record.vehicle?.vehicleNo ? ` (${record.vehicle.vehicleNo})` : ""
    }`;
  };

  // Records whose cash actually moved today via a shop payment. Their
  // totalCost row is skipped so the money is counted once, from the payments.
  const paidViaShopToday = new Set(
    maintenanceShopPayments.map((payment) => payment.maintenanceId).filter(Boolean),
  );

  maintenances.forEach((m) => {
    if (paidViaShopToday.has(m.id)) return;
    expenses.push({
      type: "MAINTENANCE",
      particular: `Maintenance - ${assetNameOf(m)}`,
      amount: m.totalCost,
      maintenanceId: m.id,
    });
  });

  maintenanceShopPayments.forEach((payment) => {
    const assetName = assetNameOf(payment.maintenance);
    expenses.push({
      type: "MAINTENANCE",
      // Unlinked payments still name the shop, so the row is never anonymous.
      particular: assetName
        ? `Maintenance - ${assetName} (${payment.shop?.name || "shop"})`
        : `Maintenance payment - ${payment.shop?.name || "shop"}`,
      partyName: payment.shop?.name || undefined,
      amount: payment.paidamount,
      maintenanceId: payment.maintenanceId ?? null,
    });
  });

  advances.forEach((a) => {
    expenses.push({
      type: "ADVANCE",
      particular: `Advance — ${a.staff.fullName}`,
      amount: a.amount,
      advanceId: a.id,
      staffId: a.staffId,
    });
  });

  additionalAdvances.forEach((a) => {
    if (a.additionalAmount) {
      expenses.push({
        type: "ADVANCE",
        particular: `Additional Advance — ${a.staff.fullName}`,
        amount: a.additionalAmount,
        advanceId: a.id,
        staffId: a.staffId,
      });
    }
  });

  purchasePayments.forEach((payment) => {
    if (payment.purchase && payment.amount) {
      expenses.push({
        type: "PURCHASE",
        particular: `Purchase payment - ${payment.purchase.particular} (${payment.purchase.serialNo}, Bill ${payment.purchase.billNo})`,
        partyName: payment.purchase.partyName || payment.supplier?.name,
        amount: payment.amount,
        purchaseId: payment.purchase.id,
      });
    }
  });

  return { expenses };
}

// ─── Calculate totals ─────────────────────────────────────────

function recalcTotals(report) {
  const totalExpenses = report.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalCashReceive = Number(report.cash) + Number(report.cashReceiveExtra);
  const cashSales = report.sales.reduce((s, i) => s + Number(i.amount), 0);
  const legacyCreditSales = report.creditSales.reduce((s, c) => s + Number(c.amount), 0);
  const newCreditTxns = (report.creditTransactions ?? []).reduce((s, c) => s + Number(c.amount), 0);
  const totalCreditSales = legacyCreditSales + newCreditTxns;
  const todaysSales = cashSales + totalCreditSales;
  // Money handed back to customers leaves the counter, so it subtracts here the
  // same way an expense does.
  const totalSalesReturns = (report.salesReturns ?? []).reduce((s, r) => s + Number(r.amount), 0);

  const cashInCounter =
    Number(report.lastClosingAmount)
    - Number(report.bankDepositAmount)
    - totalExpenses
    + totalCashReceive
    + todaysSales
    - Number(report.onlineTransfer)
    - totalCreditSales
    - totalSalesReturns;

  return {
    totalExpenses: new Decimal(totalExpenses),
    totalCashReceive: new Decimal(totalCashReceive),
    todaysSales: new Decimal(todaysSales),
    totalCreditSales: new Decimal(totalCreditSales),
    cashInCounter: new Decimal(cashInCounter),
  };
}

// ─── LIST reports ─────────────────────────────────────────────

/*
 * Expense rows for a month, flattened with the date of the report they belong
 * to. The dashboard's daily-expense graph rebuilds MAINTENANCE / ADVANCE /
 * PURCHASE from their own source tables, but PT_CASH, DISCOUNT, DONATION and
 * MISC exist ONLY as DailyExpense rows typed into a sales report — there is no
 * other table to derive them from, so they are served here.
 *
 * Deliberately narrow: only the four report-only types, and only id/type/
 * amount/particular/date. The list endpoint omits `expenses` entirely, and
 * hydrating every report just to reach these rows would be far heavier than
 * this query.
 */
const REPORT_ONLY_EXPENSE_TYPES = ["PT_CASH", "DISCOUNT", "DONATION", "MISC"];

const listManualExpensesService = async (orgId, { month, year }) => {
  const where = { report: { orgId } , type: { in: REPORT_ONLY_EXPENSE_TYPES } };

  if (month && year) {
    where.report = {
      orgId,
      date: {
        gte: new Date(Date.UTC(year, month - 1, 1)),
        lte: new Date(Date.UTC(year, month, 0)),
      },
    };
  } else if (year) {
    where.report = {
      orgId,
      date: { gte: new Date(Date.UTC(year, 0, 1)), lte: new Date(Date.UTC(year, 11, 31)) },
    };
  }

  const rows = await prisma.dailyExpense.findMany({
    where,
    select: {
      id: true,
      type: true,
      amount: true,
      particular: true,
      partyName: true,
      report: { select: { date: true } },
    },
    orderBy: { report: { date: "asc" } },
  });

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    amount: row.amount,
    particular: row.particular,
    partyName: row.partyName,
    date: row.report.date.toISOString().slice(0, 10),
  }));
};

const listReportsService = async (orgId, filters) => {
  const where = { orgId };
  if (filters.month && filters.year) {
    where.date = {
      gte: new Date(Date.UTC(filters.year, filters.month - 1, 1)),
      lte: new Date(Date.UTC(filters.year, filters.month, 0)),
    };
  } else if (filters.year) {
    where.date = {
      gte: new Date(Date.UTC(filters.year, 0, 1)),
      lte: new Date(Date.UTC(filters.year, 11, 31)),
    };
  }

  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;

  const [data, total] = await Promise.all([
    prisma.dailySalesReport.findMany({
      where,
      include: {
        createdBy: { select: { id: true, user: { select: { name: true } } } },
        approvedBy: { select: { id: true, user: { select: { name: true } } } },
        // Only the amounts — the row detail shows a total, not the rows
        // themselves, so there is no need to hydrate the whole relation.
        salesReturns: { select: { amount: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dailySalesReport.count({ where }),
  ]);

  const withReturnTotals = data.map((report) => ({
    ...report,
    totalSalesReturns: report.salesReturns.reduce((sum, r) => sum + Number(r.amount), 0),
  }));

  return { success: true, data: withReturnTotals, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

// ─── GET single report ────────────────────────────────────────

const getReportService = async (orgId, reportId) => {
  const report = await prisma.dailySalesReport.findFirst({
    where: { id: reportId, orgId },
    include: reportInclude,
  });
  if (!report) throw new AppError(404, "Report not found");
  return {
    ...report,
    totalSalesReturns: (report.salesReturns ?? []).reduce((sum, r) => sum + Number(r.amount), 0),
    nepaliDate: formatNepaliDate(new Date(report.date)),
  };
};

// ─── GET or init report for a date ───────────────────────────

const getOrInitReportService = async (orgId, createdById, dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  const existing = await prisma.dailySalesReport.findUnique({
    where: { orgId_date: { orgId, date } },
    include: reportInclude,
  });
  if (existing) {
    return {
      ...existing,
      nepaliDate: formatNepaliDate(new Date(existing.date)),
      isNew: false,
    };
  }

  const sequenceBlock = await getReportSequenceBlock(orgId, date);
  if (sequenceBlock) {
    return {
      isNew: true,
      isBlocked: true,
      date: dateStr,
      nepaliDate: formatNepaliDate(new Date(date)),
      lastClosingAmount: 0,
      autoExpenses: [],
      sales: [],
      saleEntries: [],
      creditSales: [],
      creditTransactions: [],
      ...sequenceBlock,
    };
  }

  const prevReport = await prisma.dailySalesReport.findFirst({
    where: { orgId, date: { lt: date } },
    orderBy: { date: "desc" },
  });
  const lastClosingAmount = prevReport?.cashInCounter ?? new Decimal(0);

  const { expenses } = await pullAutoExpenses(orgId, new Date(dateStr + "T00:00:00"));

  // Credit sales an Admin may have already recorded for this date via the
  // Credit Sales tab, before today's report was created.
  const orphanCreditSales = await prisma.dailyCreditSale.findMany({
    where: { orgId, date, reportId: null },
    orderBy: { partyName: "asc" },
  });

  const orphanCreditTxns = await prisma.creditTransaction.findMany({
    where: { orgId, date, reportId: null },
    include: {
      creditParty: { select: { id: true, name: true, balanceType: true } },
      tripVehicle: { select: { id: true, vehicleModel: true, volume: true } },
      material: { select: { id: true, name: true } },
      createdBy: { select: { id: true, user: { select: { name: true } } } },
    },
    orderBy: [{ createdAt: "asc" }],
  });

  const savedSaleEntries = await prisma.dailySaleEntry.findMany({
    where: { orgId, date, reportId: null },
    include: {
      material: { select: { id: true, name: true } },
      tripVehicle: { select: { id: true, vehicleModel: true, volume: true } },
      createdBy: { select: { id: true, user: { select: { name: true } } } },
    },
    orderBy: [{ createdAt: "asc" }],
  });

  return {
    isNew: true,
    date: dateStr,
    nepaliDate: formatNepaliDate(new Date(date)),
    lastClosingAmount,
    bankDepositParty: "",
    bankDepositAmount: 0,
    customerDeposit: 0,
    cash: 0,
    cashReceiveExtra: 0,
    onlineTransfer: 0,
    voidCount: 0,
    autoExpenses: expenses,
    sales: savedSaleEntries,
    saleEntries: savedSaleEntries,
    creditSales: orphanCreditSales,
    creditTransactions: orphanCreditTxns,
  };
};

// ─── CREATE report ────────────────────────────────────────────

const createSaleEntryService = async (orgId, createdById, input) => {
  const [y, m, d] = input.date.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  const existingReport = await prisma.dailySalesReport.findUnique({
    where: { orgId_date: { orgId, date } },
  });
  if (existingReport) throw new AppError(409, "Daily report already submitted for this date");
  await assertReportSequence(orgId, date);

  if (!input.materialId) throw new AppError(400, "Material is required");
  if (!input.tripVehicleId) throw new AppError(400, "Vehicle is required");
  if (!input.quantity || input.quantity <= 0) throw new AppError(400, "Quantity must be greater than zero");

  const rate = await prisma.materialRate.findFirst({
    where: { orgId, materialId: input.materialId },
    include: { details: { where: { tripVehicleId: input.tripVehicleId } } },
  });
  if (!rate || rate.details.length === 0) {
    throw new AppError(400, "No rate found for this material and vehicle combination");
  }

  const rateUsed = Number(rate.details[0].calculatedRate);
  const amount = rateUsed * input.quantity;

  return prisma.dailySaleEntry.create({
    data: {
      orgId,
      createdById,
      date,
      materialId: input.materialId,
      tripVehicleId: input.tripVehicleId,
      quantity: input.quantity,
      rateUsed: new Decimal(rateUsed),
      amount: new Decimal(amount),
    },
    include: {
      material: { select: { id: true, name: true } },
      tripVehicle: { select: { id: true, vehicleModel: true, volume: true } },
      createdBy: { select: { id: true, user: { select: { name: true } } } },
    },
  });
};

const deleteSaleEntryService = async (orgId, entryId) => {
  const entry = await prisma.dailySaleEntry.findFirst({
    where: { id: entryId, orgId, reportId: null },
  });
  if (!entry) throw new AppError(404, "Sale entry not found or already submitted");

  await prisma.dailySaleEntry.delete({ where: { id: entryId } });
  return { id: entryId };
};

const createReportService = async (orgId, createdById, input) => {
  const [y, m, d] = input.date.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  assertReportDateIsClosed(input.date);

  const existing = await prisma.dailySalesReport.findUnique({
    where: { orgId_date: { orgId, date } },
  });
  if (existing) throw new AppError(409, "A report for this date already exists");
  await assertReportSequence(orgId, date);

  const salesWithRates = await Promise.all(
    input.sales.map(async (s) => {
      const rate = await prisma.materialRate.findFirst({
        where: { orgId, materialId: s.materialId },
        include: { details: { where: { tripVehicleId: s.tripVehicleId } } },
      });
      if (!rate || rate.details.length === 0) {
        throw new AppError(400, "No rate found for this material and vehicle combination");
      }
      const rateUsed = Number(rate.details[0].calculatedRate);
      const amount = rateUsed * s.quantity;
      return { ...s, rateUsed: new Decimal(rateUsed), amount: new Decimal(amount) };
    })
  );

  const billNumber = await generateBillNumber(orgId, date);
  const inputCreditSales = input.creditSales ?? [];
  // Returns recorded on the form, plus any already saved for this date without
  // a report — mirroring how credit sales are adopted below.
  const inputSalesReturns = (input.salesReturns ?? []).filter(
    (r) => r.partyName?.trim() && Number(r.amount) > 0,
  );
  const bankDeposits = (input.bankDeposits?.length
    ? input.bankDeposits
    : input.bankDepositAmount > 0
      ? [{ party: input.bankDepositParty || "Bank Deposit", amount: input.bankDepositAmount }]
      : []
  )
    .map((deposit) => ({
      party: deposit.party?.trim() || "Bank Deposit",
      amount: Number(deposit.amount) || 0,
    }))
    .filter((deposit) => deposit.amount > 0);
  const bankDepositTotal = bankDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);

  // Credit sales an Admin may have already recorded for this date (via the
  // Credit Sales tab) before this report existed — link them in and fold
  // their amounts into today's totals.
  const orphanCreditSales = await prisma.dailyCreditSale.findMany({
    where: { orgId, date, reportId: null },
  });

  // Credit transactions (new system) already saved for this date without a report
  const orphanCreditTxns = await prisma.creditTransaction.findMany({
    where: { orgId, date, reportId: null },
    select: { id: true, amount: true },
  });

  const orphanSalesReturns = await prisma.dailySalesReturns.findMany({
    where: { orgId, date, reportId: null },
    select: { id: true, amount: true },
  });

  const savedSaleEntries = await prisma.dailySaleEntry.findMany({
    where: { orgId, date, reportId: null },
    select: {
      id: true,
      materialId: true,
      tripVehicleId: true,
      quantity: true,
      rateUsed: true,
      amount: true,
    },
  });
  const allSalesWithRates = [
    ...salesWithRates,
    ...savedSaleEntries.map((s) => ({
      materialId: s.materialId,
      tripVehicleId: s.tripVehicleId,
      quantity: s.quantity,
      rateUsed: new Decimal(Number(s.rateUsed)),
      amount: new Decimal(Number(s.amount)),
    })),
  ];

  const temp = {
    lastClosingAmount: new Decimal(input.lastClosingAmount),
    bankDepositAmount: new Decimal(bankDepositTotal),
    cash: new Decimal(input.cash),
    cashReceiveExtra: new Decimal(input.cashReceiveExtra),
    onlineTransfer: new Decimal(input.onlineTransfer),
    expenses: input.expenses.map((e) => ({ amount: new Decimal(e.amount) })),
    sales: allSalesWithRates,
    creditSales: [
      ...inputCreditSales.map((c) => ({ amount: new Decimal(c.amount) })),
      ...orphanCreditSales.map((c) => ({ amount: new Decimal(Number(c.amount)) })),
    ],
    creditTransactions: orphanCreditTxns.map((t) => ({ amount: new Decimal(Number(t.amount)) })),
    salesReturns: [
      ...inputSalesReturns.map((r) => ({ amount: new Decimal(r.amount) })),
      ...orphanSalesReturns.map((r) => ({ amount: new Decimal(Number(r.amount)) })),
    ],
  };
  const totals = recalcTotals(temp);

  return prisma.$transaction(async (tx) => {
    const report = await tx.dailySalesReport.create({
      data: {
        orgId,
        createdById,
        date,
        billNumber,
        lastClosingAmount: new Decimal(input.lastClosingAmount),
        bankDepositParty: bankDeposits[0]?.party || null,
        bankDepositAmount: new Decimal(bankDepositTotal),
        customerDeposit: new Decimal(0),
        cashParticular: input.cashParticular || null,
        cash: new Decimal(input.cash),
        cashReceiveExtraParticular: input.cashReceiveExtraParticular || null,
        cashReceiveExtra: new Decimal(input.cashReceiveExtra),
        onlineTransfer: new Decimal(input.onlineTransfer),
        voidCount: input.voidCount,
        ...totals,
        expenses: {
          create: input.expenses.map((e) => ({
            type: e.type,
            partyName: e.partyName ?? null,
            particular: e.particular,
            amount: new Decimal(e.amount),
            maintenanceId: e.maintenanceId || null,
            advanceId: e.advanceId || null,
            purchaseId: e.purchaseId || null,
            staffId: e.staffId || null,
          })),
        },
        bankDeposits: {
          create: bankDeposits.map((deposit) => ({
            party: deposit.party,
            amount: new Decimal(deposit.amount),
          })),
        },
        sales: {
          create: allSalesWithRates.map((s) => ({
            materialId: s.materialId,
            tripVehicleId: s.tripVehicleId,
            quantity: s.quantity,
            rateUsed: s.rateUsed,
            amount: s.amount,
          })),
        },
        creditSales: {
          create: inputCreditSales.map((c) => ({
            orgId,
            date,
            createdById,
            partyName: c.partyName,
            billNo: c.billNo || null,
            goodsName: c.goodsName || null,
            amount: new Decimal(c.amount),
          })),
        },
        salesReturns: {
          create: inputSalesReturns.map((r) => ({
            orgId,
            date,
            createdById,
            partyName: r.partyName.trim(),
            billNo: r.billNo || null,
            particular: r.particular || null,
            amount: new Decimal(r.amount),
            deductionBy: r.deductionBy,
            remarks: r.remarks || null,
          })),
        },
      },
      // Only select the id here — keep the transaction fast
      select: { id: true },
    });

    // Link pre-existing orphan credit sales for this date to the new report
    if (orphanCreditSales.length) {
      await tx.dailyCreditSale.updateMany({
        where: { id: { in: orphanCreditSales.map((c) => c.id) } },
        data: { reportId: report.id },
      });
    }

    // Link pre-existing orphan credit transactions for this date to the new report
    if (orphanCreditTxns.length) {
      await tx.creditTransaction.updateMany({
        where: { id: { in: orphanCreditTxns.map((t) => t.id) } },
        data: { reportId: report.id },
      });
    }

    if (savedSaleEntries.length) {
      await tx.dailySaleEntry.updateMany({
        where: { id: { in: savedSaleEntries.map((s) => s.id) } },
        data: { reportId: report.id },
      });
    }

    // Link pre-existing orphan sales returns for this date to the new report
    if (orphanSalesReturns.length) {
      await tx.dailySalesReturns.updateMany({
        where: { id: { in: orphanSalesReturns.map((r) => r.id) } },
        data: { reportId: report.id },
      });
    }

    return report.id;
    // Accelerate caps interactive transactions at 15s and rejects anything
    // higher outright (P6005), so this must stay at or under that ceiling.
  }, { timeout: 15000 })
    .then((reportId) =>
      // Fetch the full report outside the transaction so it doesn't eat into the timeout
      prisma.dailySalesReport.findUniqueOrThrow({
        where: { id: reportId },
        include: reportInclude,
      })
    );
};

// ─── APPROVE report ───────────────────────────────────────────

const approveReportService = async (orgId, approverId, reportId) => {
  const report = await prisma.dailySalesReport.findFirst({ where: { id: reportId, orgId } });
  if (!report) throw new AppError(404, "Report not found");
  if (report.status === "APPROVED") throw new AppError(409, "Already approved");

  return prisma.dailySalesReport.update({
    where: { id: reportId },
    data: {
      status: "APPROVED",
      approvedById: approverId,
      approvedAt: new Date(),
    },
    include: reportInclude,
  });
};

// ─── SUMMARY ─────────────────────────────────────────────────

const kathmanduTodayUtc = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(Date.UTC(Number(byType.year), Number(byType.month) - 1, Number(byType.day)));
};

const summaryDateRange = (view, year) => {
  const today = kathmanduTodayUtc();
  const previousDay = addUtcDays(today, -1);

  if (view === "daily") {
    return { gte: previousDay, lte: previousDay };
  }

  // Uses the requested year so the dashboard can chart past years, falling
  // back to the current year when none is given.
  if (view === "yearly") {
    const targetYear = Number(year) || today.getUTCFullYear();
    return {
      gte: new Date(Date.UTC(targetYear, 0, 1)),
      lte: new Date(Date.UTC(targetYear, 11, 31)),
    };
  }

  if (view === "weekly") {
    const firstDayOfMonth = new Date(Date.UTC(previousDay.getUTCFullYear(), previousDay.getUTCMonth(), 1));
    const sevenDayStart = addUtcDays(previousDay, -6);
    return {
      gte: sevenDayStart < firstDayOfMonth ? firstDayOfMonth : sevenDayStart,
      lte: previousDay,
    };
  }

  return {
    gte: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)),
    lte: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)),
  };
};

const getSummaryService = async (orgId, filters) => {
  const where = { orgId, date: summaryDateRange(filters.view, filters.year) };

  const reports = await prisma.dailySalesReport.findMany({
    where,
    include: {
      expenses: { select: { type: true, particular: true, amount: true } },
      sales: {
        select: {
          materialId: true,
          amount: true,
          quantity: true,
          material: { select: { id: true, name: true } },
        },
      },
      // Credit sales per material, for the dashboard's credit sales lines.
      creditTransactions: {
        select: { trips: true, amount: true, materialId: true, material: { select: { id: true, name: true } } },
      },
      creditSales: { select: { amount: true, goodsName: true } },
    },
    orderBy: { date: "asc" },
  });

  // ── Material breakdown (used by the dashboard's per-material sales chart) ──
  const materialMap = {};
  reports.forEach((r) => {
    r.sales.forEach((s) => {
      if (!materialMap[s.materialId]) {
        materialMap[s.materialId] = { materialId: s.materialId, name: s.material.name, total: 0, quantity: 0 };
      }
      materialMap[s.materialId].total += Number(s.amount);
      materialMap[s.materialId].quantity += s.quantity;
    });
  });
  const byMaterial = Object.values(materialMap).sort((a, b) => b.total - a.total);

  const totals = {
    todaysSales: reports.reduce((s, r) => s + Number(r.todaysSales), 0),
    totalExpenses: reports.reduce((s, r) => s + Number(r.totalExpenses), 0),
    totalCreditSales: reports.reduce((s, r) => s + Number(r.totalCreditSales), 0),
    cashInCounter: reports.length > 0 ? Number(reports[reports.length - 1].cashInCounter) : 0,
    reportCount: reports.length,
    ptCash: reports.reduce((s, r) => s + r.expenses.filter((e) => e.type === "PT_CASH").reduce((a, e) => a + Number(e.amount), 0), 0),
    donations: reports.reduce((s, r) => s + r.expenses.filter((e) => e.type === "DONATION").reduce((a, e) => a + Number(e.amount), 0), 0),
    misc: reports.reduce((s, r) => s + r.expenses.filter((e) => e.type === "MISC").reduce((a, e) => a + Number(e.amount), 0), 0),
    maintenance: reports.reduce((s, r) => s + r.expenses.filter((e) => e.type === "MAINTENANCE").reduce((a, e) => a + Number(e.amount), 0), 0),
    advances: reports.reduce((s, r) => s + r.expenses.filter((e) => e.type === "ADVANCE").reduce((a, e) => a + Number(e.amount), 0), 0),
    purchases: reports.reduce((s, r) => s + r.expenses.filter((e) => e.type === "PURCHASE").reduce((a, e) => a + Number(e.amount), 0), 0),
    byMaterial,
  };

  return {
    reports: reports.map((r) => ({
      ...r,
      nepaliDate: formatNepaliDate(new Date(r.date)),
    })),
    totals,
  };
};

module.exports = {
  adToBs,
  assertReportSequence,
  recalcTotals,
  listReportsService,
  listManualExpensesService,
  getReportService,
  getOrInitReportService,
  createSaleEntryService,
  deleteSaleEntryService,
  createReportService,
  approveReportService,
  getSummaryService,
  reportInclude,
};
