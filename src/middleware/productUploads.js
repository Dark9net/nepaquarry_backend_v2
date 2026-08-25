const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { AppError } = require("../lib/error");
const { uploadRoot } = require("./staffUploads");

const folder = "master-products";
const productUploadDir = path.join(uploadRoot, folder);

fs.mkdirSync(productUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, productUploadDir),
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

const productPhotoUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 200 * 1024, files: 1 },
}).single("photo");

const uploadErrorHandler = (error, _request, _response, next) => {
  if (error instanceof multer.MulterError) {
    next(new AppError(400, error.code === "LIMIT_FILE_SIZE" ? "Photo must be 200 KB or smaller." : error.message));
    return;
  }
  next(error);
};

const storedPhotoPath = (file) => `/uploads/${folder}/${file.filename}`;

// Deletes the physical file for a stored `/uploads/master-products/...` path.
// Silently no-ops on missing files — the DB record is the source of truth.
const removeStoredPhoto = (photoPath) => {
  if (!photoPath) return;
  const filename = path.basename(photoPath);
  const fullPath = path.join(productUploadDir, filename);
  fs.unlink(fullPath, () => {});
};

module.exports = { productPhotoUpload, uploadErrorHandler, storedPhotoPath, removeStoredPhoto };
