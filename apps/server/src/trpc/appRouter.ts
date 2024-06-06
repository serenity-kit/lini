import * as opaque from "@serenity-kit/opaque";
import { TRPCError } from "@trpc/server";
import "dotenv/config";
import sodium from "libsodium-wrappers";
import { z } from "zod";
import { addUserToDocument } from "../db/addUserToDocument.js";
import { createDocument } from "../db/createDocument.js";
import { createLoginAttempt } from "../db/createLoginAttempt.js";
import { createOrRefreshDocumentInvitation } from "../db/createOrRefreshDocumentInvitation.js";
import { createSession } from "../db/createSession.js";
import { createUser } from "../db/createUser.js";
import { createUserLocker } from "../db/createUserLocker.js";
import { deleteLoginAttempt } from "../db/deleteLoginAttempt.js";
import { deleteSession } from "../db/deleteSession.js";
import { getDocument } from "../db/getDocument.js";
import { getDocumentInvitation } from "../db/getDocumentInvitation.js";
import { getDocumentInvitationByToken } from "../db/getDocumentInvitationByToken.js";
import { getDocumentMembers } from "../db/getDocumentMembers.js";
import { getDocumentsByUserId } from "../db/getDocumentsByUserId.js";
import { getLatestUserLocker } from "../db/getLatestUserLocker.js";
import { getLoginAttempt } from "../db/getLoginAttempt.js";
import { getUser } from "../db/getUser.js";
import { getUserByUsername } from "../db/getUserByUsername.js";
import { updateDocument } from "../db/updateDocument.js";
import {
  LoginFinishParams,
  LoginStartParams,
  RegisterFinishParams,
  RegisterStartParams,
} from "../schema.js";
import { generateId } from "../utils/generateId/generateId.js";
import { getOpaqueServerSetup } from "../utils/getOpaqueServerSetup/getOpaqueServerSetup.js";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "../utils/trpc/trpc.js";

export const appRouter = router({
  me: protectedProcedure.query(async (opts) => {
    const user = await getUser(opts.ctx.session.userId);
    if (!user) return null;
    return { id: user.id, username: user.username };
  }),
  documents: protectedProcedure.query(async (opts) => {
    const documents = await getDocumentsByUserId(opts.ctx.session.userId);
    return documents.map((doc) => ({
      id: doc.id,
      nameCiphertext: doc.nameCiphertext,
      nameNonce: doc.nameNonce,
      nameCommitment: doc.nameCommitment,
    }));
  }),
  getDocument: protectedProcedure.input(z.string()).query(async (opts) => {
    const document = await getDocument({
      documentId: opts.input,
      userId: opts.ctx.session.userId,
    });
    if (!document) return null;
    return {
      id: document.id,
      nameCiphertext: document.nameCiphertext,
      nameNonce: document.nameNonce,
      nameCommitment: document.nameCommitment,
      isAdmin: document.users.length > 0 ? document.users[0].isAdmin : false,
    };
  }),
  updateDocument: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nameCiphertext: z.string(),
        nameNonce: z.string(),
        nameCommitment: z.string(),
      })
    )
    .mutation(async (opts) => {
      const updatedDocument = await updateDocument({
        documentId: opts.input.id,
        userId: opts.ctx.session.userId,
        nameCiphertext: opts.input.nameCiphertext,
        nameNonce: opts.input.nameNonce,
        nameCommitment: opts.input.nameCommitment,
      });
      return { id: updatedDocument.id };
    }),
  createDocument: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nameCiphertext: z.string(),
        nameNonce: z.string(),
        nameCommitment: z.string(),
      })
    )
    .mutation(async (opts) => {
      const document = await createDocument({
        userId: opts.ctx.session.userId,
        documentId: opts.input.id,
        nameCiphertext: opts.input.nameCiphertext,
        nameNonce: opts.input.nameNonce,
        nameCommitment: opts.input.nameCommitment,
      });
      return { document: { id: document.id } };
    }),

  createOrRefreshDocumentInvitation: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        ciphertext: z.string(),
        nonce: z.string(),
      })
    )
    .mutation(async (opts) => {
      const invitation = sodium.crypto_secretbox_open_easy(
        sodium.from_base64(opts.input.ciphertext),
        sodium.from_base64(opts.input.nonce),
        sodium.from_base64(opts.ctx.session.sessionKey).slice(0, 32)
      );
      const { boxCiphertext } = JSON.parse(sodium.to_string(invitation));

      const documentInvitation = await createOrRefreshDocumentInvitation({
        userId: opts.ctx.session.userId,
        documentId: opts.input.documentId,
        ciphertext: boxCiphertext,
      });
      return documentInvitation ? { token: documentInvitation.token } : null;
    }),

  documentInvitation: protectedProcedure
    .input(z.string())
    .query(async (opts) => {
      const documentInvitation = await getDocumentInvitation({
        documentId: opts.input,
        userId: opts.ctx.session.userId,
      });
      if (!documentInvitation) return null;
      return { token: documentInvitation.token };
    }),

  documentInvitationByToken: protectedProcedure
    .input(z.string())
    .query(async (opts) => {
      const documentInvitation = await getDocumentInvitationByToken({
        token: opts.input,
        userId: opts.ctx.session.userId,
      });
      if (!documentInvitation) return null;

      const invitation = JSON.stringify({
        boxCiphertext: documentInvitation.ciphertext,
      });

      const sessionNonce = sodium.randombytes_buf(
        sodium.crypto_secretbox_NONCEBYTES
      );
      const sessionCiphertext = sodium.crypto_secretbox_easy(
        invitation,
        sessionNonce,
        sodium.from_base64(opts.ctx.session.sessionKey).slice(0, 32)
      );
      return {
        ciphertext: sodium.to_base64(sessionCiphertext),
        nonce: sodium.to_base64(sessionNonce),
      };
    }),

  acceptDocumentInvitation: protectedProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async (opts) => {
      const result = await addUserToDocument({
        userId: opts.ctx.session.userId,
        documentInvitationToken: opts.input.token,
      });
      return result ? { documentId: result.documentId } : null;
    }),

  documentMembers: protectedProcedure.input(z.string()).query(async (opts) => {
    const members = await getDocumentMembers({
      documentId: opts.input,
      userId: opts.ctx.session.userId,
    });
    return members;
  }),

  logout: protectedProcedure.mutation(async (opts) => {
    await deleteSession(opts.ctx.session.token);
    opts.ctx.clearCookie();
  }),

  getLatestUserLocker: protectedProcedure.query(async (opts) => {
    const locker = await getLatestUserLocker(opts.ctx.session.userId);
    return locker;
  }),

  createUserLocker: protectedProcedure
    .input(
      z.object({
        ciphertext: z.string(),
        commitment: z.string(),
        nonce: z.string(),
        clock: z.number(),
      })
    )
    .mutation(async (opts) => {
      const { ciphertext, commitment, nonce, clock } = opts.input;

      const locker = await createUserLocker({
        userId: opts.ctx.session.userId,
        ciphertext,
        commitment,
        nonce,
        clock,
      });
      return { id: locker.id };
    }),

  registerStart: publicProcedure
    .input(RegisterStartParams)
    .mutation(async (opts) => {
      const { userIdentifier, registrationRequest } = opts.input;

      const user = await getUserByUsername(userIdentifier);
      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "user already registered",
        });
      }

      const { registrationResponse } = opaque.server.createRegistrationResponse(
        {
          serverSetup: getOpaqueServerSetup(),
          userIdentifier,
          registrationRequest,
        }
      );

      return { registrationResponse };
    }),

  registerFinish: publicProcedure
    .input(RegisterFinishParams)
    .mutation(async (opts) => {
      const { userIdentifier, registrationRecord } = opts.input;

      const existingUser = await getUserByUsername(userIdentifier);
      if (!existingUser) {
        await createUser({ username: userIdentifier, registrationRecord });
      }

      // return always the same result even if the user already exists to
      // avoid leaking the information if the user exists or not
      return;
    }),

  loginStart: publicProcedure.input(LoginStartParams).mutation(async (opts) => {
    const { userIdentifier, startLoginRequest } = opts.input;

    const user = await getUserByUsername(userIdentifier);
    if (!user)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user not registered",
      });
    const { registrationRecord, id: userId } = user;

    const loginAttempt = await getLoginAttempt(userIdentifier);
    if (loginAttempt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "login already started",
      });
    }

    const { serverLoginState, loginResponse } = opaque.server.startLogin({
      serverSetup: getOpaqueServerSetup(),
      userIdentifier,
      registrationRecord,
      startLoginRequest,
    });

    await createLoginAttempt({ userId, serverLoginState });

    return { loginResponse };
  }),
  loginFinish: publicProcedure
    .input(LoginFinishParams)
    .mutation(async (opts) => {
      const { userIdentifier, finishLoginRequest } = opts.input;

      const loginAttempt = await getLoginAttempt(userIdentifier);
      if (!loginAttempt || !loginAttempt.serverLoginState)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "login not started",
        });
      const { serverLoginState } = loginAttempt;
      const { sessionKey } = opaque.server.finishLogin({
        finishLoginRequest,
        serverLoginState,
      });

      const sessionToken = generateId(32);
      const user = await getUserByUsername(userIdentifier);
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "user not found",
        });
      }
      await createSession({ token: sessionToken, sessionKey, userId: user.id });
      await deleteLoginAttempt(user.id);

      opts.ctx.setSessionCookie(sessionToken);
      return { success: true };
    }),
});
