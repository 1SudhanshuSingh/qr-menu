import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const reviewRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ restaurantId: z.string(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.review.findMany({
        where: { restaurantId: input.restaurantId },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  getRatingDistribution: publicProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.db.review.findMany({
        where: { restaurantId: input.restaurantId },
        select: { rating: true },
      });
      const dist = [1, 2, 3, 4, 5].map((r) => ({
        rating: r,
        count: reviews.filter((rv) => rv.rating === r).length,
      }));
      const avg =
        reviews.length > 0
          ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
          : 0;
      return { distribution: dist, average: avg, total: reviews.length };
    }),
});
