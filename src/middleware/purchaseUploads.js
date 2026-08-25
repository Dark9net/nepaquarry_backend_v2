const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { AppError } = require("../lib/error");
const { uploadRoot } = require("./staffUploads");

const folder = "purchase";
const purchaseUploadDir = path.join(uploadRoot, folder);

fs.mkdirSync(purchaseUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, purchaseUploadDir),
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (_request, file, callback) => {
  if (["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.mimetype)) {
    callback(null, true);
    return;
  }
  callback(new AppError(400, "Only JPEG, PNG, WebP, or PDF files are allowed."));
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const purchaseFilesUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
}).fields([
  { name: "billFile", maxCount: 1 },
  { name: "voucherFile", maxCount: 1 },
  { name: "paymentBillFiles", maxCount: 5 },
  { name: "paymentVoucherFiles", maxCount: 5 },
]);

const uploadErrorHandler = (error, _request, _response, next) => {
  if (error instanceof multer.MulterError) {
    next(new AppError(400, error.code === "LIMIT_FILE_SIZE" ? "Upload file must be 5 MB or smaller." : error.message));
    return;
  }
  next(error);
};

const storedFilePath = (file) => file ? `/uploads/${folder}/${file.filename}` : undefined;

// Deletes a previously stored file once it has been replaced. Only deletes
// files inside the purchase folder so a malformed stored path can never
// reach outside the upload root.
const removeStoredFile = (storedPath) => {
  if (typeof storedPath !== "string") return;

  const expectedPrefix = `/uploads/${folder}/`;
  if (!storedPath.startsWith(expectedPrefix)) return;

  const filename = path.basename(storedPath);
  const target = path.join(purchaseUploadDir, filename);

  fs.promises.unlink(target).catch(() => {
    // A missing file is not an error worth failing the request over.
  });
};

module.exports = { purchaseFilesUpload, uploadErrorHandler, storedFilePath, removeStoredFile };
