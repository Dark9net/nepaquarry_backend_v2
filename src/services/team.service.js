const { hashPassword, isPasswordValid } = require("../lib/password");
const prisma = require("../config/db");
const { AppError } = require("../lib/error");

const memberSelect = {
  id: true,
  role: true,
  isActive: true,
  user: { select: { id: true, name: true, email: true, createdAt: true } },
};

const toMember = (m) => ({
  memberId: m.id,
  id: m.user.id,
  name: m.user.name,
  email: m.user.email,
  role: m.role,
  isActive: m.isActive,
  createdAt: m.user.createdAt,
});

const notFound = () => new AppError(404, "Team member not found");

const listMembers = async (orgId, filters = {}) => {
  const where = { orgId };

  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 100) : 20;

  const [rows, total] = await Promise.all([
    prisma.organizationMember.findMany({
      where,
      select: memberSelect,
      orderBy: { user: { createdAt: "asc" } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.organizationMember.count({ where }),
  ]);

  return {
    success: true,
    data: rows.map(toMember),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

const inviteMember = async (orgId, data) => {
  const email = data.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMembership = await prisma.organizationMember.findFirst({
      where: { userId: existingUser.id, orgId },
    });
    if (existingMembership) throw new AppError(409, "This person is already a member of your organization.");
  }

  const hashedPassword = await hashPassword(data.password);

  const member = await prisma.$transaction(async (tx) => {
    const user = existingUser
      ? existingUser
      : await tx.user.create({
          data: {
            email,
            name: data.name.trim(),
            password: hashedPassword,
            mustChangePassword: true,
          },
        });

    return tx.organizationMember.create({
      data: {
        userId: user.id,
        orgId,
        role: data.role,
      },
      select: memberSelect,
    });
  });

  return toMember(member);
};

const setMemberStatus = async (orgId, memberId, isActive) => {
  const member = await prisma.organizationMember.findFirst({ where: { id: memberId, orgId } });
  if (!member) throw notFound();

  const updated = await prisma.organizationMember.update({
    where: { id: memberId },
    data: { isActive },
    select: memberSelect,
  });
  return toMember(updated);
};

const setMemberRole = async (orgId, memberId, role) => {
  const member = await prisma.organizationMember.findFirst({ where: { id: memberId, orgId } });
  if (!member) throw notFound();

  const updated = await prisma.organizationMember.update({
    where: { id: memberId },
    data: { role },
    select: memberSelect,
  });
  return toMember(updated);
};

const changeOwnPassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const validPassword = await isPasswordValid(user.password, currentPassword);
  if (!validPassword) throw new AppError(401, "Current password is incorrect");

  const samePassword = await isPasswordValid(user.password, newPassword);
  if (samePassword) throw new AppError(400, "New password must be different from current password");

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword, mustChangePassword: false },
  });

  return { success: true };
};

module.exports = {
  listMembers,
  inviteMember,
  setMemberStatus,
  setMemberRole,
  changeOwnPassword,
};
