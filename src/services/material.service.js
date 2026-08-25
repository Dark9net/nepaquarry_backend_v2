const prisma = require("../config/db");
const { AppError } = require("../lib/error");

const notFound = (resource) => new AppError(404, `${resource} not found`);
const isDuplicate = (error, field = "name") =>
  error?.code === "P2002" && (!field || (error.meta?.target ?? []).some((t) => String(t).includes(field)));

const listMaterials = async (orgId, pagination, search) => {
  const where = {
    orgId,
    ...(search ? {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    } : {}),
  };
  const orderBy = [{ isActive: "desc" }, { name: "asc" }];

  if (!pagination) {
    return prisma.rawMaterial.findMany({ where, orderBy });
  }

  const { page, limit } = pagination;
  const [total, data] = await prisma.$transaction([
    prisma.rawMaterial.count({ where }),
    prisma.rawMaterial.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);
  return { data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

const createMaterial = async ({ orgId, memberId, data }) => {
  try {
    return await prisma.rawMaterial.create({ data: { ...data, orgId, createdById: memberId } });
  } catch (error) {
    if (isDuplicate(error)) throw new AppError(400, "A material with this name already exists");
    throw error;
  }
};

const updateMaterial = async ({ orgId, id, data }) => {
  const current = await prisma.rawMaterial.findFirst({ where: { id, orgId } });
  if (!current) throw notFound("Material");

  try {
    return await prisma.rawMaterial.update({ where: { id }, data });
  } catch (error) {
    if (isDuplicate(error)) throw new AppError(400, "A material with this name already exists");
    throw error;
  }
};

module.exports = { listMaterials, createMaterial, updateMaterial };
