const PDFDocument = require("pdfkit");
const salesService = require("../services/sales.service");
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

const listReports = respond((request) =>
  salesService.listReportsService(request.auth.orgId, request.query));

// Report-only expense rows (PT Cash, Discount, Donation, Misc) for the
// dashboard's daily-expense graph.
const listManualExpenses = respond((request) =>
  salesService.listManualExpensesService(request.auth.orgId, {
    month: request.query.month ? Number(request.query.month) : undefined,
    year: request.query.year ? Number(request.query.year) : undefined,
  }));

const getReport = respond((request) =>
  salesService.getReportService(request.auth.orgId, request.params.id));

const initReport = respond((request) =>
  salesService.getOrInitReportService(request.auth.orgId, request.auth.memberId, request.query.date));

const createReport = respond((request) =>
  salesService.createReportService(request.auth.orgId, request.auth.memberId, request.body), 201);

const approveReport = respond((request) =>
  salesService.approveReportService(request.auth.orgId, request.auth.memberId, request.params.id));

const getSummary = respond((request) => salesService.getSummaryService(request.auth.orgId, request.query));

const createSaleEntry = respond((request) =>
  salesService.createSaleEntryService(request.auth.orgId, request.auth.memberId, request.body), 201);

const deleteSaleEntry = respond((request) =>
  salesService.deleteSaleEntryService(request.auth.orgId, request.params.id));

// ─── PDF download ──────────────────────────────────────────────

const money = (value) => Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const downloadReportPdf = async (request, response, next) => {
  try {
    const report = await salesService.getReportService(request.auth.orgId, request.params.id);
    if (!report) throw new AppError(404, "Report not found");

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const filename = `daily-sales-expense-report-${report.date.toISOString().slice(0, 10)}${report.billNumber ? `-${report.billNumber}` : ""}.pdf`;

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(response);

    doc.fontSize(16).text("Daily Sales & Expense Report", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#475569")
      .text(`${report.nepaliDate}  •  Bill No: ${report.billNumber || "-"}  •  Status: ${report.status}`, { align: "center" });
    doc.fillColor("#000000");
    doc.moveDown(1);

    doc.fontSize(12).text("Summary", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);
    [
      ["Last Closing Amount", money(report.lastClosingAmount)],
      ["Bank Deposit", money(report.bankDepositAmount)],
      ["Total Expenses", money(report.totalExpenses)],
      ["Total Cash Received", money(report.totalCashReceive)],
      ["Today's Sales", money(report.todaysSales)],
      ["Total Credit Sales", money(report.totalCreditSales)],
      ["Online Transfer", money(report.onlineTransfer)],
      ["Cash In Counter", money(report.cashInCounter)],
    ].forEach(([label, value]) => {
      doc.text(`${label}: ${value}`);
    });
    doc.moveDown(1);

    if (report.expenses.length) {
      doc.fontSize(12).text("Expenses", { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10);
      report.expenses.forEach((expense) => {
        doc.text(`${expense.type} — ${expense.particular}: ${money(expense.amount)}`);
      });
      doc.moveDown(1);
    }

    if (report.sales.length) {
      doc.fontSize(12).text("Sales", { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10);
      report.sales.forEach((sale) => {
        doc.text(`${sale.material.name} (${sale.tripVehicle.vehicleModel}) x ${sale.quantity} @ ${money(sale.rateUsed)} = ${money(sale.amount)}`);
      });
      doc.moveDown(1);
    }

    if (report.creditSales.length) {
      doc.fontSize(12).text("Credit Sales", { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10);
      report.creditSales.forEach((c) => {
        doc.text(`${c.partyName}${c.goodsName ? ` — ${c.goodsName}` : ""}: ${money(c.amount)}`);
      });
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listReports,
  listManualExpenses,
  getReport,
  initReport,
  createReport,
  approveReport,
  getSummary,
  createSaleEntry,
  deleteSaleEntry,
  downloadReportPdf,
};
