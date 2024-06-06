import { generateId } from "../utils/generateId/generateId.js";
import { prisma } from "./prisma.js";

type Params = {
  userId: string;
  documentId: string;
  nameCiphertext: string;
  nameNonce: string;
  nameCommitment: string;
};

export const createDocument = async ({
  userId,
  documentId,
  nameCiphertext,
  nameNonce,
  nameCommitment,
}: Params) => {
  return prisma.document.create({
    data: {
      id: documentId,
      nameCiphertext,
      nameNonce,
      nameCommitment,
      users: {
        create: {
          userId,
          isAdmin: true,
        },
      },
      documentInvitations: {
        create: {
          token: generateId(16),
        },
      },
    },
  });
};
