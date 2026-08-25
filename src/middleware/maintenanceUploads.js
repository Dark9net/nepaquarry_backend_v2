const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { AppError } = require("../lib/error");

const uploadRoot = path.join(__dirname, "..", "..", "uploads");
const voucherFolder = "maintenance-vouchers";

fs.mkdirSync(path.join(uploadRoot, voucherFolder), { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, path.join(uploadRoot, voucherFolder)),
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

// Voucher photos per maintenance record. Kept in step with MAX_PHOTOS in
// frontend/src/pages/vehicle/VehicleMaintenance.tsx — the picker stops the
// user at this count, and these limits are what actually enforce it.
const MAX_VOUCHER_PHOTOS = 5;

const voucherUploads = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 200 * 1024, files: MAX_VOUCHER_PHOTOS },
}).array("voucherPhotos", MAX_VOUCHER_PHOTOS);

const uploadErrorHandler = (error, _request, _response, next) => {
  if (error instanceof multer.MulterError) {
    next(new AppError(400, error.code === "LIMIT_FILE_SIZE" ? "Each photo must be 200 KB or smaller." : error.message));
    return;
  }
  next(error);
};

const storedVoucherPaths = (files = []) => files.map((file) => `/uploads/${voucherFolder}/${file.filename}`);

module.exports = { voucherUploads, uploadErrorHandler, storedVoucherPaths };
