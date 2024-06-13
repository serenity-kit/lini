import { prisma } from "./prisma.js";

export const getLatestUserLocker = async (userId: string) => {
  const locker = await prisma.userLocker.findFirst({
    where: {
      userId,
    },
    orderBy: {
      clock: "desc",
    },
  });
  return locker;
};
