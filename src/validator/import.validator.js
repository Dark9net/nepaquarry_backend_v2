const path = require("path");
const multer = require("multer");
const { AppError } = require("../lib/error");

const REQUIRED_MASTER_PRODUCT_IMPORT_COLUMNS = ["productCode", "name"];

const MASTER_PRODUCT_IMPORT_COLUMNS = [
  "productCode",
  "name",
  "category",
  "size",
  "serialNo",
  "location",
  "reorderLevel",
  "supplierAName",
  "supplierARate",
  "supplierBName",
  "supplierBRate",
  "supplierCName",
  "supplierCRate",
];

const ALLOWED_EXCEL_EXTENSIONS = new Set([".xlsx", ".xlsm"]);

const uploadImportFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ALLOWED_EXCEL_EXTENSIONS.has(ext)) {
      cb(null, true);
      return;
    }

    cb(new AppError(400, "Only .xlsx or .xlsm Excel files are allowed"));
  },
}).single("file");

const validateMasterProductImportFile = (request, _response, next) => {
  if (!request.file) {
    next(new AppError(400, "Excel file is required"));
    return;
  }

  next();
};

module.exports = {
  REQUIRED_MASTER_PRODUCT_IMPORT_COLUMNS,
  MASTER_PRODUCT_IMPORT_COLUMNS,
  uploadImportFile,
  validateMasterProductImportFile,
};
