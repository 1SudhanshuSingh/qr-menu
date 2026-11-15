import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// All procedures scoped to a restaurantId — auth enforcement is a TODO
export const restaurantRouter = createTRPCRouter({
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.restaurant.findUnique({ where: { slug: input.slug } });
    }),

  getStats: publicProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { restaurantId } = input;
      const [
        totalDishes,
        availableDishes,
        featuredDishes,
        totalCategories,
        totalReviews,
        recentReviews,
        callsToday,
      ] = await Promise.all([
        ctx.db.dish.count({ where: { category: { restaurantId } } }),
        ctx.db.dish.count({ where: { category: { restaurantId }, isAvailable: true } }),
        ctx.db.dish.count({ where: { category: { restaurantId }, isFeatured: true } }),
        ctx.db.category.count({ where: { restaurantId } }),
        ctx.db.review.count({ where: { restaurantId } }),
        ctx.db.review.aggregate({
          where: { restaurantId, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
          _avg: { rating: true },
          _count: true,
        }),
        ctx.db.waiterCall.count({
          where: {
            restaurantId,
            resolved: false,
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
      ]);

      const pageViewsToday = await ctx.db.analyticsEvent.count({
        where: {
          restaurantId,
          type: "page_view",
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      });

      return {
        totalDishes,
        availableDishes,
        soldOutDishes: totalDishes - availableDishes,
        featuredDishes,
        totalCategories,
        totalReviews,
        weeklyReviewCount: recentReviews._count,
        weeklyAvgRating: recentReviews._avg.rating ?? 0,
        pageViewsToday,
        callsToday,
      };
    }),

  updateInfo: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        name: z.string().min(1).optional(),
        tagline: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        instagramHandle: z.string().optional(),
        googleReviewUrl: z.string().url().optional().or(z.literal("")),
        defaultLocale: z.string().optional(),
        enabledLocales: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { restaurantId, ...data } = input;
      return ctx.db.restaurant.update({ where: { id: restaurantId }, data });
    }),
});
