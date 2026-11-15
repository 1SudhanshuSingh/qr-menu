import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { menuRouter } from "~/server/api/routers/menu";
import { restaurantRouter } from "~/server/api/routers/restaurant";
import { dishesRouter } from "~/server/api/routers/dishes";
import { reviewRouter } from "~/server/api/routers/review";
import { tablesRouter } from "~/server/api/routers/tables";

export const appRouter = createTRPCRouter({
  menu: menuRouter,
  restaurant: restaurantRouter,
  dishes: dishesRouter,
  review: reviewRouter,
  tables: tablesRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
