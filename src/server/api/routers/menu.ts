import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const menuRouter = createTRPCRouter({
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), locale: z.string().default("pt") }))
    .query(async ({ ctx, input }) => {
      const restaurant = await ctx.db.restaurant.findUnique({
        where: { slug: input.slug, isPublished: true },
        include: {
          categories: {
            where: { isVisible: true },
            orderBy: { sortOrder: "asc" },
            include: {
              translations: {
                where: { locale: { in: [input.locale, "pt"] } },
              },
              dishes: {
                orderBy: { sortOrder: "asc" },
                include: {
                  translations: {
                    where: { locale: { in: [input.locale, "pt"] } },
                  },
                },
              },
            },
          },
        },
      });

      if (!restaurant) return null;

      return restaurant;
    }),
});
