const prisma = require("../config/db");
const { AppError } = require("../lib/error");
const { removeStoredSlip } = require("../middleware/staffManagementUploads");

const leaveInclude = {
  staff:      { select: { id: true, fullName: true, employeeCode: true } },
  createdBy:  { include: { user: { select: { name: true } } } },
  reviewedBy: { include: { user: { select: { name: true } } } },
};

const notFound = (resource) => new AppError(404, `${resource} not found`);

const assertStaff = async (orgId, staffId) => {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, orgId, deletedAt: null } });
  if (!staff) throw new AppError(400, "Select an active staff member in your organization.");
  return staff;
};

const buildLeaveWhere = (orgId, { staffId, status, month, year }) => {
  const where = { orgId };
  if (staffId) where.staffId = staffId;
  if (status) where.status = status;
  if (month && year) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    where.leaveFrom = { gte: start, lt: end };
  } else if (year) {
    where.leaveFrom = { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) };
  }
  return where;
};

const listLeaves = async (orgId, filters, pagination) => {
  const where = buildLeaveWhere(orgId, filters);
  const orderBy = [{ createdAt: "desc" }];

  if (!pagination) {
    return prisma.leaveRequest.findMany({ where, include: leaveInclude, orderBy });
  }

  const { page, limit } = pagination;
  const [total, data] = await prisma.$transaction([
    prisma.leaveRequest.count({ where }),
    prisma.leaveRequest.findMany({ where, include: leaveInclude, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);
  return { data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

const createLeave = async ({ orgId, memberId, data }) => {
  await assertStaff(orgId, data.staffId);

  if (data.leaveTo < data.leaveFrom) {
    throw new AppError(400, "Leave to date cannot be before leave from date.");
  }

  return prisma.leaveRequest.create({
    data: {
      orgId,
      staffId:      data.staffId,
      createdById:  memberId,
      leaveFrom:    data.leaveFrom,
      leaveTo:      data.leaveTo,
      numberOfDays: data.numberOfDays,
      reason:       data.reason,
    },
    include: leaveInclude,
  });
};

const reviewLeave = async ({ orgId, memberId, id, data }) => {
  const leave = await prisma.leaveRequest.findFirst({ where: { id, orgId } });
  if (!leave) throw notFound("Leave request");
  if (leave.status !== "PENDING") throw new AppError(400, "Only pending leave requests can be reviewed.");

  return prisma.leaveRequest.update({
    where: { id },
    data: {
      status:       data.status,
      reviewNote:   data.reviewNote,
      reviewedById: memberId,
      reviewedAt:   new Date(),
    },
    include: leaveInclude,
  });
};

const deleteLeave = async ({ orgId, id }) => {
  const leave = await prisma.leaveRequest.findFirst({ where: { id, orgId } });
  if (!leave) throw notFound("Leave request");
  if (leave.status !== "PENDING") throw new AppError(400, "Only pending leave requests can be deleted.");

  await prisma.leaveRequest.delete({ where: { id } });
  removeStoredSlip(leave.leaveSlipUrl);
  return { id };
};

const uploadLeaveSlip = async ({ orgId, id, slipUrl }) => {
  const leave = await prisma.leaveRequest.findFirst({ where: { id, orgId } });
  if (!leave) throw notFound("Leave request");
  if (!slipUrl) throw new AppError(400, "A slip file is required.");

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: { leaveSlipUrl: slipUrl },
    include: leaveInclude,
  });

  // Drop the replaced file only after the new path is safely persisted.
  if (leave.leaveSlipUrl && leave.leaveSlipUrl !== slipUrl) {
    removeStoredSlip(leave.leaveSlipUrl);
  }

  return updated;
};

module.exports = { listLeaves, createLeave, reviewLeave, deleteLeave, uploadLeaveSlip };
