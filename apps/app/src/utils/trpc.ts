import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/index";

export const trpc = createTRPCReact<AppRouter>();
