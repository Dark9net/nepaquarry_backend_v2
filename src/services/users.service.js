const prisma = require("../config/db");

// "Order to" recipients for the Orders page: admins, supervisors, and
// procurement members who can action a request once it reaches them.
const listSupervisors = async (orgId) => {
  const members = await prisma.organizationMember.findMany({
    where: { orgId, isActive: true, role: { in: ["ADMIN", "SUPERVISOR", "PROCUREMENT"] } },
    select: { id: true, role: true, user: { select: { name: true } } },
    orderBy: { role: "asc" },
  });

  return members.map((member) => ({
    memberId: member.id,
    name: member.user.name,
    role: member.role,
  }));
};

module.exports = { listSupervisors };
