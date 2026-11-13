import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { menuRouter } from "~/server/api/routers/menu";

export const appRouter = createTRPCRouter({
  menu: menuRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
