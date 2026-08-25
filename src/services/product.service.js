const prisma = require("../config/db");
const { AppError } = require("../lib/error");
const { removeStoredPhoto } = require("../middleware/productUploads");

const notFound = (resource) => new AppError(404, `${resource} not found`);
const isDuplicate = (error, field) =>
  error?.code === "P2002" && (!field || (error.meta?.target ?? []).some((t) => String(t).includes(field)));

// ─── Product categories ─────────────────────────────────────────

const listCategories = async (orgId, includeInactive, pagination, search) => {
  const where = {
    orgId,
    ...(includeInactive ? {} : { isActive: true }),
    ...(search ? { name: { contains: search } } : {}),
  };
  const orderBy = { name: "asc" };

  if (!pagination) {
    return prisma.productCategory.findMany({ where, orderBy });
  }

  const { page, limit } = pagination;
  const [total, inactiveCount, data] = await prisma.$transaction([
    prisma.productCategory.count({ where }),
    prisma.productCategory.count({ where: { orgId, isActive: false } }),
    prisma.productCategory.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);
  return { data, total, inactiveCount, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

const createCategory = async ({ orgId, memberId, data }) => {
  try {
    return await prisma.productCategory.create({ data: { ...data, orgId, createdById: memberId } });
  } catch (error) {
    if (isDuplicate(error, "name")) throw new AppError(400, "Category already exists");
    throw error;
  }
};

const updateCategory = async ({ orgId, id, data }) => {
  const current = await prisma.productCategory.findFirst({ where: { id, orgId } });
  if (!current) throw notFound("Category");

  try {
    return await prisma.productCategory.update({ where: { id }, data });
  } catch (error) {
    if (isDuplicate(error, "name")) throw new AppError(400, "Category already exists");
    throw error;
  }
};

// ─── Master products ─────────────────────────────────────────────

const listProducts = async (orgId, pagination, filters = {}) => {
  const { search, category } = filters;
  const where = {
    orgId,
    ...(category ? { category } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search } },
        { productCode: { contains: search } },
      ],
    } : {}),
  };
  const orderBy = [{ isActive: "desc" }, { name: "asc" }];

  if (!pagination) {
    return prisma.masterProduct.findMany({ where, orderBy });
  }

  const { page, limit } = pagination;
  const [total, data] = await prisma.$transaction([
    prisma.masterProduct.count({ where }),
    prisma.masterProduct.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);
  return { data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

const createProduct = async ({ orgId, memberId, data }) => {
  try {
    return await prisma.masterProduct.create({ data: { ...data, orgId, createdById: memberId } });
  } catch (error) {
    if (isDuplicate(error, "productCode")) throw new AppError(400, "A product with this code already exists");
    throw error;
  }
};

const updateProduct = async ({ orgId, id, data }) => {
  const current = await prisma.masterProduct.findFirst({ where: { id, orgId } });
  if (!current) throw notFound("Product");

  try {
    return await prisma.masterProduct.update({ where: { id }, data });
  } catch (error) {
    if (isDuplicate(error, "productCode")) throw new AppError(400, "A product with this code already exists");
    throw error;
  }
};

const PHOTO_FIELDS = { 1: "photo1", 2: "photo2", 3: "photo3" };

const setProductPhoto = async ({ orgId, id, slot, photoPath }) => {
  const field = PHOTO_FIELDS[slot];
  if (!field) throw new AppError(400, "Photo slot must be 1, 2, or 3");

  const current = await prisma.masterProduct.findFirst({ where: { id, orgId } });
  if (!current) throw notFound("Product");

  const previous = current[field];
  const updated = await prisma.masterProduct.update({ where: { id }, data: { [field]: photoPath } });
  if (previous) removeStoredPhoto(previous);
  return updated;
};

const removeProductPhoto = async ({ orgId, id, slot }) => {
  const field = PHOTO_FIELDS[slot];
  if (!field) throw new AppError(400, "Photo slot must be 1, 2, or 3");

  const current = await prisma.masterProduct.findFirst({ where: { id, orgId } });
  if (!current) throw notFound("Product");

  const previous = current[field];
  const updated = await prisma.masterProduct.update({ where: { id }, data: { [field]: null } });
  if (previous) removeStoredPhoto(previous);
  return updated;
};

module.exports = {
  listCategories, createCategory, updateCategory,
  listProducts, createProduct, updateProduct,
  setProductPhoto, removeProductPhoto,
};
