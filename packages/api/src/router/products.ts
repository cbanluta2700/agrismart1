import { z } from "zod";
import { db } from "@saasfly/db";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const productsRouter = createTRPCRouter({
  // Get all products with filtering and pagination
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
        categoryId: z.string().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z
          .enum(["price_asc", "price_desc", "newest", "oldest"])
          .optional()
          .default("newest"),
      }),
    )
    .query(async ({ input }) => {
      const { limit, cursor, categoryId, search, minPrice, maxPrice, sortBy } = input;

      // Build query filter based on input params
      let orderBy = {};
      switch (sortBy) {
        case "price_asc":
          orderBy = { price: "asc" };
          break;
        case "price_desc":
          orderBy = { price: "desc" };
          break;
        case "oldest":
          orderBy = { createdAt: "asc" };
          break;
        case "newest":
        default:
          orderBy = { createdAt: "desc" };
          break;
      }

      // Build filter based on input
      const filter: any = {
        isActive: true,
      };

      if (categoryId) {
        filter.categoryId = categoryId;
      }

      if (search) {
        filter.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ];
      }

      if (minPrice !== undefined) {
        filter.price = { ...filter.price, gte: minPrice };
      }

      if (maxPrice !== undefined) {
        filter.price = { ...filter.price, lte: maxPrice };
      }

      // Handle cursor-based pagination
      if (cursor) {
        filter.id = { lt: cursor };
      }

      const products = await db.product.findMany({
        take: limit + 1,
        where: filter,
        orderBy,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      let nextCursor: string | null = null;
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem?.id || null;
      }

      return {
        products,
        nextCursor,
      };
    }),

  // Get a single product by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { id } = input;
      const product = await db.product.findUnique({
        where: { id },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Calculate average rating
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : 0;

      return {
        ...product,
        avgRating,
      };
    }),

  // Create a new product (sellers only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(100),
        description: z.string().min(10),
        price: z.number().positive(),
        categoryId: z.string(),
        images: z.array(z.string()).min(1),
        stock: z.number().nonnegative().default(0),
        tags: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, user } = ctx;

      // Check if user is a seller
      if (user.role !== "SELLER" && user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only sellers can create products",
        });
      }

      // Check if category exists
      const categoryExists = await db.category.findUnique({
        where: { id: input.categoryId },
      });

      if (!categoryExists) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid category",
        });
      }

      // Create the product
      const product = await db.product.create({
        data: {
          ...input,
          sellerId: userId,
        },
      });

      return product;
    }),

  // Update an existing product (seller only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).max(100).optional(),
        description: z.string().min(10).optional(),
        price: z.number().positive().optional(),
        categoryId: z.string().optional(),
        images: z.array(z.string()).min(1).optional(),
        stock: z.number().nonnegative().optional(),
        tags: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, user } = ctx;
      const { id, ...updateData } = input;

      // Fetch the product to check ownership
      const product = await db.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if user is the product owner or an admin
      if (product.sellerId !== userId && user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own products",
        });
      }

      // If categoryId is provided, check if it exists
      if (updateData.categoryId) {
        const categoryExists = await db.category.findUnique({
          where: { id: updateData.categoryId },
        });

        if (!categoryExists) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid category",
          });
        }
      }

      // Update the product
      const updatedProduct = await db.product.update({
        where: { id },
        data: updateData,
      });

      return updatedProduct;
    }),

  // Delete a product (seller only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, user } = ctx;
      const { id } = input;

      // Fetch the product to check ownership
      const product = await db.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if user is the product owner or an admin
      if (product.sellerId !== userId && user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own products",
        });
      }

      // Instead of actually deleting, just mark as inactive
      // This is better for maintaining order history and references
      const updatedProduct = await db.product.update({
        where: { id },
        data: { isActive: false },
      });

      return updatedProduct;
    }),

  // Get all categories (for product listing filters)
  getCategories: publicProcedure.query(async () => {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });
    return categories;
  }),
});
