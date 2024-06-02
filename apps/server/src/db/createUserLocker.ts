import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";

type Params = {
  userId: string;
  ciphertext: string;
  nonce: string;
  commitment: string;
  clock: number;
};

export const createUserLocker = async ({
  userId,
  ciphertext,
  clock,
  commitment,
  nonce,
}: Params) => {
  return await prisma.$transaction(
    async (prisma) => {
      const userLocker = await prisma.userLocker.findFirst({
        where: {
          userId,
        },
        orderBy: {
          clock: "desc",
        },
      });

      if (userLocker === null) {
        if (clock !== 0) {
          throw new Error("Invalid clock, expected 0");
        }
      } else if (userLocker.clock + 1 !== clock) {
        throw new Error("Invalid clock");
      }

      const locker = await prisma.userLocker.create({
        data: {
          userId,
          ciphertext,
          nonce,
          commitment,
          clock,
        },
      });
      return { id: locker.id };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
};
