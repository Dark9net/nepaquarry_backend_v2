class AppError extends Error {
  constructor(statusCode, message, issues) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.issues = issues;
  }
}

module.exports = {
  AppError,
};
