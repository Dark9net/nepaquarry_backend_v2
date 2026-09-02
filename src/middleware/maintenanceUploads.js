const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { AppError } = require("../lib/error");

const uploadRoot = path.join(__dirname, "..", "..", "uploads");
const voucherFolder = "maintenance-vouchers";
const billFolder = "maintenance-bills";
const shopPaymentVoucherFolder = "maintenance-shop-payment-vouchers";

for (const folder of [voucherFolder, billFolder, shopPaymentVoucherFolder]) {
  fs.mkdirSync(path.join(uploadRoot, folder), { recursive: true });
}

const makeStorage = (folder) => multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, path.join(uploadRoot, folder)),
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

const imageFilter = (_request, file, callback) => {
  if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
    callback(null, true);
    return;
  }
  callback(new AppError(400, "Only JPEG, PNG, and WebP images are allowed."));
};

// Bills and payment vouchers also accept PDF, matching the purchase module's
// upload rules — a scanned or emailed invoice is very often a PDF.
const documentFilter = (_request, file, callback) => {
  if (["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.mimetype)) {
    callback(null, true);
    return;
  }
  callback(new AppError(400, "Only JPEG, PNG, WebP, or PDF files are allowed."));
};

// Voucher photos per maintenance record. Kept in step with MAX_PHOTOS in
// frontend/src/pages/vehicle/VehicleMaintenance.tsx — the picker stops the
// user at this count, and these limits are what actually enforce it.
const MAX_VOUCHER_PHOTOS = 5;

const voucherUploads = multer({
  storage: makeStorage(voucherFolder),
  fileFilter: imageFilter,
  limits: { fileSize: 200 * 1024, files: MAX_VOUCHER_PHOTOS },
}).array("voucherPhotos", MAX_VOUCHER_PHOTOS);

const MAX_BILL_FILE_SIZE = 5 * 1024 * 1024;

// The shop's bill/invoice for a maintenance job — a single file, uploaded
// (or replaced) independently of the rest of the record via its own
// endpoint. See vehicle-maintenance.service.js#uploadBill.
const billUpload = multer({
  storage: makeStorage(billFolder),
  fileFilter: documentFilter,
  limits: { fileSize: MAX_BILL_FILE_SIZE, files: 1 },
}).single("billFile");

const MAX_SHOP_PAYMENT_VOUCHERS = 5;

// Proof for a shop payment. Mirrors purchaseUploads.js's installment
// vouchers: several files may back a single payment.
const shopPaymentVoucherUploads = multer({
  storage: makeStorage(shopPaymentVoucherFolder),
  fileFilter: documentFilter,
  limits: { fileSize: MAX_BILL_FILE_SIZE, files: MAX_SHOP_PAYMENT_VOUCHERS },
}).array("voucherFiles", MAX_SHOP_PAYMENT_VOUCHERS);

// The "New Record" form submits both a bill (proof of the job's own
// invoice) and, optionally, a voucher for its initial payment — two
// different documents that belong in two different folders, so the
// destination is picked per-field rather than per-upload.
const maintenanceCreateStorage = multer.diskStorage({
  destination: (_request, file, callback) => {
    const folder = file.fieldname === "billFile" ? billFolder : shopPaymentVoucherFolder;
    callback(null, path.join(uploadRoot, folder));
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

const maintenanceCreateUpload = multer({
  storage: maintenanceCreateStorage,
  fileFilter: documentFilter,
  limits: { fileSize: MAX_BILL_FILE_SIZE, files: 2 },
}).fields([
  { name: "billFile", maxCount: 1 },
  { name: "voucherFile", maxCount: 1 },
]);

const uploadErrorHandler = (error, _request, _response, next) => {
  if (error instanceof multer.MulterError) {
    let message = error.message;
    if (error.code === "LIMIT_FILE_SIZE") {
      message = error.field === "voucherPhotos" ? "Each photo must be 200 KB or smaller." : "Upload file must be 5 MB or smaller.";
    }
    next(new AppError(400, message));
    return;
  }
  next(error);
};

const storedVoucherPaths = (files = []) => files.map((file) => `/uploads/${voucherFolder}/${file.filename}`);
const storedBillPath = (file) => (file ? `/uploads/${billFolder}/${file.filename}` : undefined);
const storedShopPaymentVoucherPaths = (files = []) => files.map((file) => `/uploads/${shopPaymentVoucherFolder}/${file.filename}`);

// Deletes a previously stored file once it has been replaced or cleared.
// Only deletes files inside this middleware's own folders, so a malformed
// stored path can never reach outside the upload root.
const removeStoredFileIn = (folder) => (storedPath) => {
  if (typeof storedPath !== "string") return;

  const expectedPrefix = `/uploads/${folder}/`;
  if (!storedPath.startsWith(expectedPrefix)) return;

  const filename = path.basename(storedPath);
  const target = path.join(uploadRoot, folder, filename);

  fs.promises.unlink(target).catch(() => {
    // A missing file is not an error worth failing the request over.
  });
};

const removeStoredBillFile = removeStoredFileIn(billFolder);
const removeStoredShopPaymentVoucherFile = removeStoredFileIn(shopPaymentVoucherFolder);

module.exports = {
  voucherUploads,
  billUpload,
  shopPaymentVoucherUploads,
  maintenanceCreateUpload,
  uploadErrorHandler,
  storedVoucherPaths,
  storedBillPath,
  storedShopPaymentVoucherPaths,
  removeStoredBillFile,
  removeStoredShopPaymentVoucherFile,
};
