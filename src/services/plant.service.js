const prisma = require("../config/db");
const { AppError } = require("../lib/error");

const notFound = (resource) => new AppError(404, `${resource} not found`);
const isDuplicate = (error, field = "name") =>
  error?.code === "P2002" && (!field || (error.meta?.target ?? []).some((t) => String(t).includes(field)));

const listPlants = (orgId) =>
  prisma.plant.findMany({
    where: { orgId },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

const createPlant = async ({ orgId, memberId, data }) => {
  try {
    return await prisma.plant.create({
      data: { ...data, orgId, createdById: memberId },
    });
  } catch (error) {
    if (isDuplicate(error)) throw new AppError(400, "A plant with this name already exists");
    throw error;
  }
};

const updatePlant = async ({ orgId, id, data }) => {
  const current = await prisma.plant.findFirst({ where: { id, orgId } });
  if (!current) throw notFound("Plant");

  try {
    return await prisma.plant.update({ where: { id }, data });
  } catch (error) {
    if (isDuplicate(error)) throw new AppError(400, "A plant with this name already exists");
    throw error;
  }
};

module.exports = { listPlants, createPlant, updatePlant };
