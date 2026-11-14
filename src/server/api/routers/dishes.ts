import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const dishesRouter = createTRPCRouter({
  listByRestaurant: publicProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.category.findMany({
        where: { restaurantId: input.restaurantId },
        orderBy: { sortOrder: "asc" },
        include: {
          translations: true,
          dishes: {
            orderBy: { sortOrder: "asc" },
            include: { translations: true },
          },
        },
      });
    }),

  toggleAvailable: publicProcedure
    .input(z.object({ dishId: z.string(), isAvailable: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dish.update({
        where: { id: input.dishId },
        data: { isAvailable: input.isAvailable },
      });
    }),

  toggleFeatured: publicProcedure
    .input(z.object({ dishId: z.string(), isFeatured: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dish.update({
        where: { id: input.dishId },
        data: { isFeatured: input.isFeatured },
      });
    }),

  updatePrice: publicProcedure
    .input(z.object({ dishId: z.string(), pricecents: z.number().int().min(0) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dish.update({
        where: { id: input.dishId },
        data: { pricecents: input.pricecents },
      });
    }),

  toggleCategoryVisible: publicProcedure
    .input(z.object({ categoryId: z.string(), isVisible: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.update({
        where: { id: input.categoryId },
        data: { isVisible: input.isVisible },
      });
    }),
});
