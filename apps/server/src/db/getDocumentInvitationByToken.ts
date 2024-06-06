import { prisma } from "./prisma.js";

type Params = {
  token: string;
  userId: string;
};

export const getDocumentInvitationByToken = async ({
  token,
  userId,
}: Params) => {
  const documentInvitation = await prisma.documentInvitation.findUnique({
    where: {
      token,
    },
  });

  return documentInvitation;
};
