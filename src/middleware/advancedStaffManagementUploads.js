const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { AppError } = require("../lib/error");

const uploadRoot = path.join(__dirname, "..", "..", "uploads");
const advanceSlipFolder = "advance-slips";

fs.mkdirSync(path.join(uploadRoot, advanceSlipFolder), { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, path.join(uploadRoot, advanceSlipFolder)),
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

const slipFilter = (_request, file, callback) => {
  if (["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.mimetype)) {
    callback(null, true);
    return;
  }
  callback(new AppError(400, "Only JPEG, PNG, WebP, or PDF files are allowed."));
};

const advanceSlipUpload = multer({
  storage,
  fileFilter: slipFilter,
  limits: { fileSize: 200 * 1024, files: 1 },
}).single("slip");

const uploadErrorHandler = (error, _request, _response, next) => {
  if (error instanceof multer.MulterError) {
    next(new AppError(400, error.code === "LIMIT_FILE_SIZE" ? "File must be 200 KB or smaller." : error.message));
    return;
  }
  next(error);
};

const storedSlipPath = (file) => file ? `/uploads/${advanceSlipFolder}/${file.filename}` : undefined;

// Removes a previously stored slip once it has been replaced. Only deletes
// files inside the advance-slip folder so a malformed stored path can never
// reach outside the upload root.
const removeStoredSlip = (storedPath) => {
  if (typeof storedPath !== "string") return;

  const expectedPrefix = `/uploads/${advanceSlipFolder}/`;
  if (!storedPath.startsWith(expectedPrefix)) return;

  const filename = path.basename(storedPath);
  const target = path.join(uploadRoot, advanceSlipFolder, filename);

  fs.promises.unlink(target).catch(() => {
    // A missing file is not an error worth failing the request over.
  });
};

module.exports = { advanceSlipUpload, uploadErrorHandler, storedSlipPath, removeStoredSlip };
