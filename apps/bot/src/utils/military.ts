import { prisma } from "@nyx/database";

export class MilitaryError extends Error {}

export async function createUnit(guildId: string, name: string, roleId: string | null) {
  const existing = await prisma.militaryUnit.findUnique({ where: { guildId_name: { guildId, name } } });
  if (existing) throw new MilitaryError("unit_exists");

  return prisma.militaryUnit.create({ data: { guildId, name, roleId } });
}

export async function getUnit(guildId: string, name: string) {
  return prisma.militaryUnit.findUnique({ where: { guildId_name: { guildId, name } } });
}

export async function listUnits(guildId: string) {
  return prisma.militaryUnit.findMany({ where: { guildId }, orderBy: { name: "asc" } });
}

export async function createRank(guildId: string, unitId: string, name: string, order: number, roleId: string | null, requiredPoints: number) {
  const existing = await prisma.militaryRank.findUnique({ where: { unitId_name: { unitId, name } } });
  if (existing) throw new MilitaryError("rank_exists");

  return prisma.militaryRank.create({ data: { guildId, unitId, name, order, roleId, requiredPoints } });
}

export async function listRanks(unitId: string) {
  return prisma.militaryRank.findMany({ where: { unitId }, orderBy: { order: "asc" } });
}

/** 隊列に加入する。既に別の隊列に所属している場合はエラー(先に脱退が必要)。加入時の階級はその隊列の最下位階級(あれば)。 */
export async function joinUnit(guildId: string, userId: string, unitId: string) {
  const existing = await prisma.militaryMember.findUnique({ where: { guildId_userId: { guildId, userId } } });
  if (existing) throw new MilitaryError("already_in_unit");

  const lowestRank = await prisma.militaryRank.findFirst({ where: { unitId }, orderBy: { order: "asc" } });

  return prisma.militaryMember.create({
    data: { guildId, userId, unitId, rankId: lowestRank?.id ?? null },
  });
}

export async function leaveUnit(guildId: string, userId: string) {
  const existing = await prisma.militaryMember.findUnique({ where: { guildId_userId: { guildId, userId } } });
  if (!existing) throw new MilitaryError("not_in_unit");

  await prisma.militaryMember.delete({ where: { guildId_userId: { guildId, userId } } });
  return existing;
}

export async function getMember(guildId: string, userId: string) {
  return prisma.militaryMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
    include: { unit: true, rank: true },
  });
}

/** 手動で階級を変更する(昇進/降格どちらも)。ロール付け替えは呼び出し側で行う。 */
export async function setRank(guildId: string, userId: string, rankId: string) {
  const member = await prisma.militaryMember.findUnique({ where: { guildId_userId: { guildId, userId } } });
  if (!member) throw new MilitaryError("not_in_unit");

  const rank = await prisma.militaryRank.findUnique({ where: { id: rankId } });
  if (!rank || rank.unitId !== member.unitId) throw new MilitaryError("rank_not_in_unit");

  return prisma.militaryMember.update({ where: { guildId_userId: { guildId, userId } }, data: { rankId } });
}

export async function addPoints(guildId: string, userId: string, amount: number) {
  const member = await prisma.militaryMember.findUnique({ where: { guildId_userId: { guildId, userId } } });
  if (!member) throw new MilitaryError("not_in_unit");

  return prisma.militaryMember.update({ where: { guildId_userId: { guildId, userId } }, data: { points: { increment: amount } } });
}

export async function getUnitLeaderboard(unitId: string, limit = 10) {
  return prisma.militaryMember.findMany({
    where: { unitId },
    orderBy: { points: "desc" },
    take: limit,
    include: { rank: true },
  });
}
