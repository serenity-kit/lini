import { twoDaysAgo } from "../utils/twoDaysAgo.js";
import { prisma } from "./prisma.js";

type Params = {
  token: string;
  userId: string;
};

export const getDocumentInvitationByToken = async ({ token }: Params) => {
  const documentInvitation = await prisma.documentInvitation.findUnique({
    where: {
      token,
      // not older than 2 days
      createdAt: {
        gte: twoDaysAgo(),
      },
    },
  });

  return documentInvitation;
};
