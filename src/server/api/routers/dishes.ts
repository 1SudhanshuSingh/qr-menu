import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type Allergen, type DietaryTag } from "@prisma/client";

const translationInput = z.array(
  z.object({ locale: z.string(), name: z.string().min(1), description: z.string().optional() }),
);

export const dishesRouter = createTRPCRouter({
  // ── Queries ──────────────────────────────────────────────────

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

  // ── Category mutations ────────────────────────────────────────

  createCategory: publicProcedure
    .input(z.object({
      restaurantId: z.string(),
      translations: translationInput,
      sortOrder: z.number().int().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.create({
        data: {
          restaurantId: input.restaurantId,
          sortOrder: input.sortOrder,
          translations: {
            create: input.translations.map((t) => ({
              locale: t.locale,
              name: t.name,
            })),
          },
        },
        include: { translations: true, dishes: { include: { translations: true } } },
      });
    }),

  updateCategory: publicProcedure
    .input(z.object({
      categoryId: z.string(),
      translations: translationInput,
      sortOrder: z.number().int().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.categoryTranslation.deleteMany({ where: { categoryId: input.categoryId } });
      return ctx.db.category.update({
        where: { id: input.categoryId },
        data: {
          ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
          translations: {
            create: input.translations.map((t) => ({
              locale: t.locale,
              name: t.name,
            })),
          },
        },
        include: { translations: true, dishes: { include: { translations: true } } },
      });
    }),

  deleteCategory: publicProcedure
    .input(z.object({ categoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.delete({ where: { id: input.categoryId } });
    }),

  toggleCategoryVisible: publicProcedure
    .input(z.object({ categoryId: z.string(), isVisible: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.update({
        where: { id: input.categoryId },
        data: { isVisible: input.isVisible },
      });
    }),

  // ── Dish mutations ────────────────────────────────────────────

  createDish: publicProcedure
    .input(z.object({
      categoryId:  z.string(),
      pricecents:  z.number().int().min(0),
      imageUrl:    z.string().url().optional().or(z.literal("")),
      isAvailable: z.boolean().default(true),
      isFeatured:  z.boolean().default(false),
      isSpecial:   z.boolean().default(false),
      allergens:   z.array(z.string()).default([]),
      dietaryTags: z.array(z.string()).default([]),
      sortOrder:   z.number().int().default(0),
      translations: z.array(z.object({
        locale:      z.string(),
        name:        z.string().min(1),
        description: z.string().optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dish.create({
        data: {
          categoryId:  input.categoryId,
          pricecents:  input.pricecents,
          imageUrl:    input.imageUrl ?? null,
          isAvailable: input.isAvailable,
          isFeatured:  input.isFeatured,
          isSpecial:   input.isSpecial,
          allergens:   input.allergens as Allergen[],
          dietaryTags: input.dietaryTags as DietaryTag[],
          sortOrder:   input.sortOrder,
          translations: {
            create: input.translations.map((t) => ({
              locale:      t.locale,
              name:        t.name,
              description: t.description ?? null,
            })),
          },
        },
        include: { translations: true },
      });
    }),

  updateDish: publicProcedure
    .input(z.object({
      dishId:      z.string(),
      categoryId:  z.string().optional(),
      pricecents:  z.number().int().min(0).optional(),
      imageUrl:    z.string().url().optional().or(z.literal("")),
      isAvailable: z.boolean().optional(),
      isFeatured:  z.boolean().optional(),
      isSpecial:   z.boolean().optional(),
      allergens:   z.array(z.string()).optional(),
      dietaryTags: z.array(z.string()).optional(),
      sortOrder:   z.number().int().optional(),
      translations: z.array(z.object({
        locale:      z.string(),
        name:        z.string().min(1),
        description: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { dishId, translations, imageUrl, allergens, dietaryTags, ...fields } = input;

      if (translations) {
        await ctx.db.dishTranslation.deleteMany({ where: { dishId } });
      }

      return ctx.db.dish.update({
        where: { id: dishId },
        data: {
          ...fields,
          ...(imageUrl !== undefined ? { imageUrl: imageUrl ?? null } : {}),
          ...(allergens !== undefined ? { allergens: allergens as unknown as Allergen[] } : {}),
          ...(dietaryTags !== undefined ? { dietaryTags: dietaryTags as unknown as DietaryTag[] } : {}),
          ...(translations ? {
            translations: {
              create: translations.map((t) => ({
                locale:      t.locale,
                name:        t.name,
                description: t.description ?? null,
              })),
            },
          } : {}),
        },
        include: { translations: true },
      });
    }),

  deleteDish: publicProcedure
    .input(z.object({ dishId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dish.delete({ where: { id: input.dishId } });
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
});
