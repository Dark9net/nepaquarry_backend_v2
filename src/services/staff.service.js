const prisma = require("../config/db");
const { AppError } = require("../lib/error");

const staffInclude = { dept: { select: { id: true, name: true, code: true } } };
const notFound = (resource) => new AppError(404, `${resource} not found`);

const assertDepartment = async (orgId, deptId, allowInactive = false) => {
  const department = await prisma.department.findFirst({ where: { id: deptId, orgId } });
  if (!department || (!allowInactive && !department.isActive)) throw new AppError(400, "Select an active department in your organization.");
  return department;
};

const listDepartments = async (orgId, includeInactive, pagination) => {
  const where = { orgId, ...(includeInactive ? {} : { isActive: true }) };
  const include = { _count: { select: { staff: { where: { isActive: true, deletedAt: null } } } } };
  const orderBy = { name: "asc" };

  if (!pagination) {
    return prisma.department.findMany({ where, include, orderBy });
  }

  const { page, limit } = pagination;
  const [total, inactiveCount, data] = await prisma.$transaction([
    prisma.department.count({ where }),
    prisma.department.count({ where: { orgId, isActive: false } }),
    prisma.department.findMany({ where, include, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);
  return { data, total, inactiveCount, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};
const createDepartment = ({ orgId, data }) => prisma.department.create({ data: { ...data, orgId } });
const updateDepartment = async ({ orgId, id, data }) => {
  const department = await prisma.department.findFirst({ where: { id, orgId } });
  if (!department) throw notFound("Department");
  return prisma.department.update({ where: { id }, data });
};

const listStaff = async (orgId, pagination) => {
  const where = { orgId, deletedAt: null };
  const orderBy = [{ isActive: "desc" }, { fullName: "asc" }];

  if (!pagination) {
    return prisma.staff.findMany({ where, include: staffInclude, orderBy });
  }

  const { page, limit } = pagination;
  const [total, data] = await prisma.$transaction([
    prisma.staff.count({ where }),
    prisma.staff.findMany({ where, include: staffInclude, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);
  return { data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};
const isDuplicate = (error, field = "employeeCode") =>
  error?.code === "P2002" && (!field || (error.meta?.target ?? []).some((t) => String(t).includes(field)));

const createStaff = async ({ orgId, memberId, data, photos }) => {
  await assertDepartment(orgId, data.deptId);

  // Friendly duplicate check (unique on [orgId, employeeCode]).
  const existing = await prisma.staff.findFirst({ where: { orgId, employeeCode: data.employeeCode } });
  if (existing) throw new AppError(400, "Employee code already exists");

  try {
    return await prisma.staff.create({
      data: {
        ...data,
        orgId,
        createdById: memberId,
        licensePhotoUrl: photos.licensePhoto,
        citizenshipphotoUrl: photos.citizenshipPhoto,
        profilephotoUrl: photos.profilePhoto,
      },
      include: staffInclude,
    });
  } catch (error) {
    if (isDuplicate(error)) throw new AppError(400, "Employee code already exists");
    throw error;
  }
};
const updateStaff = async ({ orgId, id, data, photos }) => {
  const current = await prisma.staff.findFirst({ where: { id, orgId, deletedAt: null } });
  if (!current) throw notFound("Staff member");
  if (data.deptId) await assertDepartment(orgId, data.deptId, data.deptId === current.deptId);

  if (data.employeeCode && data.employeeCode !== current.employeeCode) {
    const existing = await prisma.staff.findFirst({
      where: { orgId, employeeCode: data.employeeCode, NOT: { id } },
    });
    if (existing) throw new AppError(400, "Employee code already exists");
  }

  try {
    return await prisma.staff.update({
      where: { id },
      data: {
        ...data,
        ...(photos.licensePhoto ? { licensePhotoUrl: photos.licensePhoto } : {}),
        ...(photos.citizenshipPhoto ? { citizenshipphotoUrl: photos.citizenshipPhoto } : {}),
        ...(photos.profilePhoto ? { profilephotoUrl: photos.profilePhoto } : {}),
      },
      include: staffInclude,
    });
  } catch (error) {
    if (isDuplicate(error)) throw new AppError(400, "Employee code already exists");
    throw error;
  }
};
const deactivateStaff = async ({ orgId, id }) => {
  const staff = await prisma.staff.findFirst({ where: { id, orgId, deletedAt: null } });
  if (!staff) throw notFound("Staff member");
  return prisma.staff.update({ where: { id }, data: { isActive: false }, include: staffInclude });
};

module.exports = { listDepartments, createDepartment, updateDepartment, listStaff, createStaff, updateStaff, deactivateStaff };
