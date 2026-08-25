const prisma = require("../config/db");
const { AppError } = require("../lib/error");

const driverInclude = {
  drivers: {
    orderBy: { assignedAt: "asc" },
    include: { staff: { select: { id: true, fullName: true, employeeCode: true } } },
  },
};

const notFound = (resource) => new AppError(404, `${resource} not found`);
const isDuplicate = (error, field = "vehicleNo") =>
  error?.code === "P2002" && (!field || (error.meta?.target ?? []).some((t) => String(t).includes(field)));

// Confirms every id belongs to an active staff member in this org, so drivers
// can't be attached across organizations or point at deactivated staff.
const assertDrivers = async (orgId, staffIds) => {
  if (!staffIds || staffIds.length === 0) return;
  const unique = [...new Set(staffIds)];
  const found = await prisma.staff.findMany({
    where: { id: { in: unique }, orgId, isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (found.length !== unique.length) {
    throw new AppError(400, "One or more selected drivers are invalid or inactive.");
  }
};

const listVehicles = (orgId) =>
  prisma.vehicle.findMany({
    where: { orgId },
    include: driverInclude,
    orderBy: [{ isActive: "desc" }, { VehicleModel: "asc" }],
  });

const createVehicle = async ({ orgId, memberId, data }) => {
  const { driverStaffIds, ...vehicleData } = data;
  await assertDrivers(orgId, driverStaffIds);

  try {
    return await prisma.vehicle.create({
      data: {
        ...vehicleData,
        orgId,
        createdById: memberId,
        drivers: driverStaffIds?.length
          ? { create: driverStaffIds.map((staffId, index) => ({ staffId, isPrimary: index === 0 })) }
          : undefined,
      },
      include: driverInclude,
    });
  } catch (error) {
    if (isDuplicate(error)) throw new AppError(400, "A vehicle with this plate number already exists");
    throw error;
  }
};

const updateVehicle = async ({ orgId, id, data }) => {
  const current = await prisma.vehicle.findFirst({ where: { id, orgId } });
  if (!current) throw notFound("Vehicle");

  const { driverStaffIds, ...vehicleData } = data;
  if (driverStaffIds) await assertDrivers(orgId, driverStaffIds);

  try {
    return await prisma.$transaction(async (tx) => {
      if (driverStaffIds) {
        await tx.vehicleDriver.deleteMany({ where: { vehicleId: id } });
        if (driverStaffIds.length) {
          await tx.vehicleDriver.createMany({
            data: driverStaffIds.map((staffId, index) => ({ vehicleId: id, staffId, isPrimary: index === 0 })),
          });
        }
      }

      return tx.vehicle.update({
        where: { id },
        data: vehicleData,
        include: driverInclude,
      });
    });
  } catch (error) {
    if (isDuplicate(error)) throw new AppError(400, "A vehicle with this plate number already exists");
    throw error;
  }
};

module.exports = { listVehicles, createVehicle, updateVehicle };
