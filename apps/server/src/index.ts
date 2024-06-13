import * as trpcExpress from "@trpc/server/adapters/express";
import cookie from "cookie";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import "dotenv/config";
import express from "express";
import { WebSocketServer } from "ws";
import { createSnapshot } from "./db/createSnapshot.js";
import { createUpdate } from "./db/createUpdate.js";
import { getDocumentData } from "./db/getDocumentData.js";
import { getSession } from "./db/getSession.js";
import { getUserHasAccessToDocument } from "./db/getUserHasAccessToDocument.js";
import { createWebSocketConnection } from "./secsync-server/createWebsocketConnection.js";
import { appRouter } from "./trpc/appRouter.js";
import { createContext } from "./utils/trpc/trpc.js";

const webSocketServer = new WebSocketServer({ noServer: true });
const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3030;
const app = express();

app.use(express.json());
app.use(cookieParser());

const corsOptions: CorsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://www.lini.app"
      : "http://localhost:8081",
  credentials: true,
};

app.use(cors(corsOptions));

export type AppRouter = typeof appRouter;

app.use(
  "/api",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.get("/", (_req, res) => {
  res.send(`Server is running`);
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

webSocketServer.on(
  "connection",
  createWebSocketConnection({
    getDocument: getDocumentData,
    createSnapshot: createSnapshot,
    createUpdate: createUpdate,
    // @ts-expect-error
    hasAccess: async ({ documentId, websocketSessionKey, connection }) => {
      return getUserHasAccessToDocument({
        documentId,
        userId: connection.session.userId,
      });
    },
    hasBroadcastAccess: async ({ documentId, websocketSessionKeys }) =>
      websocketSessionKeys.map(() => true),
    logging: "error",
  })
);

server.on("upgrade", async (request, socket, head) => {
  // validating the session
  const cookies = cookie.parse(request.headers.cookie || "");
  const sessionToken = cookies.session;
  if (!sessionToken) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  const session = await getSession(sessionToken);
  if (!session) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  webSocketServer.handleUpgrade(request, socket, head, (currentSocket) => {
    // @ts-expect-error adding the session to the socket so we can access it in the network adapter
    currentSocket.session = session;
    webSocketServer.emit("connection", currentSocket, request);
  });
});
