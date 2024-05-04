import { z } from "zod";
import { procedure, router } from "../trpc";
import { chatRouter } from "./chat";

export const appRouter = router({
  chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
