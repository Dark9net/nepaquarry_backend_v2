const productService = require("../services/product.service");
const { storedPhotoPath } = require("../middleware/productUploads");
const { AppError } = require("../lib/error");

const respond = (handler, status = 200) => async (request, response, next) => {
  try { response.status(status).json({ data: await handler(request) }); } catch (error) { next(error); }
};

// Returns { page, limit } only when both are valid positive integers; otherwise null (full list).
const parsePagination = (query) => {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);
  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) return null;
  return { page, limit: Math.min(limit, 100) };
};

// ─── Categories ────────────────────────────────────────────────
const listCategories = respond((request) =>
  productService.listCategories(
    request.auth.orgId,
    request.query.all === "true",
    parsePagination(request.query),
    typeof request.query.search === "string" ? request.query.search.trim() : undefined,
  ));
const createCategory = respond((request) => productService.createCategory({
  orgId: request.auth.orgId, memberId: request.auth.memberId, data: request.body,
}), 201);
const updateCategory = respond((request) => productService.updateCategory({
  orgId: request.auth.orgId, id: request.params.id, data: request.body,
}));

// ─── Products ──────────────────────────────────────────────────
const listProducts = respond((request) =>
  productService.listProducts(request.auth.orgId, parsePagination(request.query), {
    search: typeof request.query.search === "string" ? request.query.search.trim() : undefined,
    category: typeof request.query.category === "string" ? request.query.category.trim() : undefined,
  }));
const createProduct = respond((request) => productService.createProduct({
  orgId: request.auth.orgId, memberId: request.auth.memberId, data: request.body,
}), 201);
const updateProduct = respond((request) => productService.updateProduct({
  orgId: request.auth.orgId, id: request.params.id, data: request.body,
}));

const uploadProductPhoto = respond((request) => {
  if (!request.file) throw new AppError(400, "A photo file is required.");
  return productService.setProductPhoto({
    orgId: request.auth.orgId,
    id: request.params.id,
    slot: Number.parseInt(request.params.slot, 10),
    photoPath: storedPhotoPath(request.file),
  });
});

const deleteProductPhoto = respond((request) => productService.removeProductPhoto({
  orgId: request.auth.orgId,
  id: request.params.id,
  slot: Number.parseInt(request.params.slot, 10),
}));

module.exports = {
  listCategories, createCategory, updateCategory,
  listProducts, createProduct, updateProduct,
  uploadProductPhoto, deleteProductPhoto,
};
