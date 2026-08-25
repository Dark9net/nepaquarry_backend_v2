const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { AppError } = require("../lib/error");

const uploadRoot = path.join(__dirname, "..", "..", "uploads");
const folders = {
  licensePhoto: "staff-liscence",
  citizenshipPhoto: "staff-citizenship",
  profilePhoto: "staff-profile",
};

Object.values(folders).forEach((folder) => fs.mkdirSync(path.join(uploadRoot, folder), { recursive: true }));

const storage = multer.diskStorage({
  destination: (_request, file, callback) => callback(null, path.join(uploadRoot, folders[file.fieldname])),
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

const staffUploads = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 200 * 1024, files: 3 },
}).fields([
  { name: "licensePhoto", maxCount: 1 },
  { name: "citizenshipPhoto", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 },
]);

const uploadErrorHandler = (error, _request, _response, next) => {
  if (error instanceof multer.MulterError) {
    next(new AppError(400, error.code === "LIMIT_FILE_SIZE" ? "Each photo must be 200 KB or smaller." : error.message));
    return;
  }
  next(error);
};

const storedPhotoPaths = (files = {}) => Object.fromEntries(
  Object.entries(files).map(([field, uploaded]) => [
    field,
    `/uploads/${folders[field]}/${uploaded[0].filename}`,
  ]),
);

module.exports = { staffUploads, uploadErrorHandler, storedPhotoPaths, uploadRoot };
