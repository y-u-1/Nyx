import { prisma } from "@nyx/database";

/**
 * 国民登録(パスポート)システム。
 * 申請 → (承認/却下) → 承認時に国民番号を発行してロールを付与、という流れを管理する。
 */

export class CitizenError extends Error {}

/** 新規に申請する。既に承認済み/審査中の申請がある場合はエラー。却下済みなら再申請扱いで上書きする。 */
export async function applyForCitizenship(guildId: string, userId: string, requestedRoleId: string | null, reason: string | null) {
  const existing = await prisma.citizen.findUnique({ where: { guildId_userId: { guildId, userId } } });

  if (existing && existing.status !== "rejected") {
    throw new CitizenError(existing.status === "approved" ? "already_citizen" : "already_pending");
  }

  return prisma.citizen.upsert({
    where: { guildId_userId: { guildId, userId } },
    create: { guildId, userId, requestedRoleId, reason, status: "pending" },
    update: {
      requestedRoleId,
      reason,
      status: "pending",
      appliedAt: new Date(),
      rejectedAt: null,
      rejectedById: null,
      rejectReason: null,
    },
  });
}

/** 申請を承認し、国民番号を発行する(サーバー内で1から連番)。ロール付与自体は呼び出し側(コマンド側)で行う。 */
export async function approveCitizenship(guildId: string, userId: string, approvedById: string) {
  const application = await prisma.citizen.findUnique({ where: { guildId_userId: { guildId, userId } } });
  if (!application || application.status !== "pending") {
    throw new CitizenError("no_pending_application");
  }

  const last = await prisma.citizen.findFirst({
    where: { guildId, citizenNumber: { not: null } },
    orderBy: { citizenNumber: "desc" },
    select: { citizenNumber: true },
  });
  const nextNumber = (last?.citizenNumber ?? 0) + 1;

  return prisma.citizen.update({
    where: { guildId_userId: { guildId, userId } },
    data: { status: "approved", citizenNumber: nextNumber, approvedAt: new Date(), approvedById },
  });
}

/** 申請を却下する。 */
export async function rejectCitizenship(guildId: string, userId: string, rejectedById: string, reason: string | null) {
  const application = await prisma.citizen.findUnique({ where: { guildId_userId: { guildId, userId } } });
  if (!application || application.status !== "pending") {
    throw new CitizenError("no_pending_application");
  }

  return prisma.citizen.update({
    where: { guildId_userId: { guildId, userId } },
    data: { status: "rejected", rejectedAt: new Date(), rejectedById, rejectReason: reason },
  });
}

export async function getCitizen(guildId: string, userId: string) {
  return prisma.citizen.findUnique({ where: { guildId_userId: { guildId, userId } } });
}

export async function getPendingApplications(guildId: string, limit = 20) {
  return prisma.citizen.findMany({ where: { guildId, status: "pending" }, orderBy: { appliedAt: "asc" }, take: limit });
}
