import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const tablesRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.table.findMany({
        where: { restaurantId: input.restaurantId },
        orderBy: [{ number: "asc" }],
      });
    }),

  create: publicProcedure
    .input(z.object({
      restaurantId: z.string(),
      number: z.string().min(1).max(20),
      label: z.string().max(60).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.table.create({
        data: {
          restaurantId: input.restaurantId,
          number: input.number.trim(),
          label: input.label?.trim() ?? null,
        },
      });
    }),

  createBulk: publicProcedure
    .input(z.object({
      restaurantId: z.string(),
      from: z.number().int().min(1),
      to: z.number().int().min(1).max(200),
    }))
    .mutation(async ({ ctx, input }) => {
      const { restaurantId, from, to } = input;
      if (to < from) throw new Error("'to' must be ≥ 'from'");
      const numbers = Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
      // Skip duplicates — upsert silently ignores existing tables
      const results = await Promise.allSettled(
        numbers.map((number) =>
          ctx.db.table.upsert({
            where: { restaurantId_number: { restaurantId, number } },
            update: {},
            create: { restaurantId, number },
          }),
        ),
      );
      return { created: results.filter((r) => r.status === "fulfilled").length };
    }),

  delete: publicProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.table.delete({ where: { id: input.tableId } });
    }),
});
