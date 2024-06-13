import { prisma } from "./prisma.js";

type Params = {
  documentId: string;
  userId: string;
  nameCiphertext: string;
  nameNonce: string;
  nameCommitment: string;
};

export const updateDocument = async ({
  documentId,
  userId,
  nameCiphertext,
  nameNonce,
  nameCommitment,
}: Params) => {
  const document = await prisma.document.update({
    data: {
      nameCiphertext,
      nameNonce,
      nameCommitment,
    },
    where: {
      id: documentId,
      users: { some: { userId, isAdmin: true } },
    },
  });
  return document;
};
