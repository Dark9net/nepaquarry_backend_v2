const ExcelJS = require("exceljs");
const prisma = require("../config/db");
const { AppError } = require("../lib/error");
const {
  MASTER_PRODUCT_IMPORT_COLUMNS,
  REQUIRED_MASTER_PRODUCT_IMPORT_COLUMNS,
} = require("../validator/import.validator");

const MASTER_PRODUCT_IMPORT_LOOKUP = new Map(
  MASTER_PRODUCT_IMPORT_COLUMNS.map((column) => [normalizeHeader(column), column])
);

function normalizeHeader(value) {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function optionalText(value) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function requiredText(value, column, rowNumber) {
  const trimmed = value.trim();
  if (!trimmed) throw new AppError(400, `Row ${rowNumber}: ${column} is required`);
  return trimmed;
}

function parseWholeNumber(value, column, rowNumber) {
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const parsed = Number(trimmed.replace(/,/g, ""));
  if (!Number.isInteger(parsed)) {
    throw new AppError(400, `Row ${rowNumber}: ${column} must be a whole number`);
  }

  return parsed;
}

function parseDecimal(value, column, rowNumber) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed.replace(/,/g, ""));
  if (!Number.isFinite(parsed)) {
    throw new AppError(400, `Row ${rowNumber}: ${column} must be a valid number`);
  }

  return parsed;
}

async function parseMasterProductImport(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new AppError(400, "The workbook does not contain any worksheets");

  const headerRow = worksheet.getRow(1);
  const mappedColumns = new Map();

  for (let columnIndex = 1; columnIndex <= headerRow.cellCount; columnIndex += 1) {
    const headerText = headerRow.getCell(columnIndex).text.trim();
    if (!headerText) continue;

    const matchedColumn = MASTER_PRODUCT_IMPORT_LOOKUP.get(normalizeHeader(headerText));
    if (matchedColumn) mappedColumns.set(columnIndex, matchedColumn);
  }

  const matchedColumns = Array.from(new Set(mappedColumns.values()));
  const missingColumns = REQUIRED_MASTER_PRODUCT_IMPORT_COLUMNS.filter(
    (column) => !matchedColumns.includes(column)
  );

  if (missingColumns.length > 0) {
    throw new AppError(400, `Missing required Excel columns: ${missingColumns.join(", ")}`);
  }

  const rows = [];
  const productCodesInFile = new Set();

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const values = new Map();

    for (const [columnIndex, field] of mappedColumns.entries()) {
      values.set(field, row.getCell(columnIndex).text.trim());
    }

    if (Array.from(values.values()).every((value) => value === "")) continue;

    const productCode = requiredText(values.get("productCode") ?? "", "productCode", rowNumber);
    const name = requiredText(values.get("name") ?? "", "name", rowNumber);

    if (productCodesInFile.has(productCode)) {
      throw new AppError(400, `Row ${rowNumber}: duplicate productCode "${productCode}" in file`);
    }
    productCodesInFile.add(productCode);

    const createData = {
      productCode,
      name,
      photo1: null,
      photo2: null,
      photo3: null,
      isActive: true,
    };
    const updateData = {
      name,
      photo1: null,
      photo2: null,
      photo3: null,
      isActive: true,
    };

    const textColumns = [
      "category",
      "size",
      "serialNo",
      "location",
      "supplierAName",
      "supplierBName",
      "supplierCName",
    ];

    for (const column of textColumns) {
      if (!values.has(column)) continue;
      const parsedValue = optionalText(values.get(column) ?? "");
      createData[column] = parsedValue;
      updateData[column] = parsedValue;
    }

    if (values.has("reorderLevel")) {
      const reorderLevel = parseWholeNumber(values.get("reorderLevel") ?? "", "reorderLevel", rowNumber);
      createData.reorderLevel = reorderLevel;
      updateData.reorderLevel = reorderLevel;
    }

    const rateColumns = ["supplierARate", "supplierBRate", "supplierCRate"];

    for (const column of rateColumns) {
      if (!values.has(column)) continue;
      const parsedValue = parseDecimal(values.get(column) ?? "", column, rowNumber);
      createData[column] = parsedValue;
      updateData[column] = parsedValue;
    }

    rows.push({ productCode, createData, updateData });
  }

  if (rows.length === 0) {
    throw new AppError(400, "The workbook does not contain any product rows to import");
  }

  return {
    worksheetName: worksheet.name,
    matchedColumns,
    rows,
  };
}

const importMasterProductsService = async (orgId, createdById, fileBuffer) => {
  const { worksheetName, matchedColumns, rows } = await parseMasterProductImport(fileBuffer);
  const productCodes = rows.map((row) => row.productCode);

  const existingProducts = await prisma.masterProduct.findMany({
    where: { orgId, productCode: { in: productCodes } },
    select: { productCode: true },
  });
  const existingCodes = new Set(existingProducts.map((product) => product.productCode));

  // Accelerate caps interactive ($transaction(async tx => ...)) transactions at
  // 15s, so a row-by-row loop over a large workbook cannot finish inside one.
  // Because the existing product codes are already known, the work splits into
  // one bulk insert for new rows plus one update per changed row, which needs
  // far fewer round trips than an upsert per row.
  const newRows = rows.filter((row) => !existingCodes.has(row.productCode));
  const changedRows = rows.filter((row) => existingCodes.has(row.productCode));

  if (newRows.length > 0) {
    await prisma.masterProduct.createMany({
      data: newRows.map((row) => ({ orgId, createdById, ...row.createData })),
      skipDuplicates: true,
    });
  }

  // Updates still have to be issued individually (each row sets different
  // values), so they are grouped into batched array transactions. Sized against
  // the 15s ceiling: from a remote region 25 writes take ~4.5s and 50 exceed
  // the limit, so 20 leaves headroom on slower links.
  const BATCH_SIZE = 20;

  const updates = changedRows.map((row) =>
    prisma.masterProduct.update({
      where: { orgId_productCode: { orgId, productCode: row.productCode } },
      data: row.updateData,
    })
  );

  // A single batch runs comfortably inside the limit, but back-to-back batches
  // over a slow link occasionally trip P2028 ("transaction not found" / closed).
  // Since each batch is independent and every write is an idempotent update to
  // a fixed value, retrying a failed batch is safe.
  for (let index = 0; index < updates.length; index += BATCH_SIZE) {
    const batch = updates.slice(index, index + BATCH_SIZE);

    for (let attempt = 1; ; attempt += 1) {
      try {
        await prisma.$transaction(batch);
        break;
      } catch (error) {
        if (error?.code !== "P2028" || attempt === 3) throw error;
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  const updatedCount = rows.filter((row) => existingCodes.has(row.productCode)).length;

  return {
    worksheetName,
    processedCount: rows.length,
    createdCount: rows.length - updatedCount,
    updatedCount,
    matchedColumns,
    requiredColumns: REQUIRED_MASTER_PRODUCT_IMPORT_COLUMNS,
  };
};

module.exports = { importMasterProductsService };
