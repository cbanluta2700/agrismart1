import { z } from "zod";
import { db } from "@saasfly/db";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import crypto from 'crypto';

// Define the schema for address
const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

// Define the schema for creating an order
const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: z.enum(["credit_card", "paypal"]),
  totalAmount: z.number().positive(),
  notes: z.string().optional(),
});

// Define the order router
export const ordersRouter = createTRPCRouter({
  // Get all orders for the current user
  getUserOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const { cursor, status } = input;

      const userId = ctx.userId as string;
      
      let query = db.selectFrom("Order")
        .where("userId", "=", userId)
        .orderBy("createdAt", "desc")
        .limit(limit + 1);
      
      if (status) {
        query = query.where("status", "=", status);
      }

      if (cursor) {
        query = query.where("id", "<", cursor);
      }
      
      const orders = await query.selectAll().execute();

      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const orderItems = await db.selectFrom("OrderItem")
            .where("orderId", "=", order.id)
            .leftJoin("Product", "Product.id", "OrderItem.productId")
            .selectAll()
            .execute();
            
          return {
            ...order,
            orderItems,
          };
        })
      );

      let nextCursor: typeof cursor | undefined = undefined;
      if (orders.length > limit) {
        const nextItem = orders.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: ordersWithItems,
        nextCursor,
      };
    }),

  // Get a specific order by ID
  getOrderById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId as string;

      const order = await db.selectFrom("Order")
        .where("id", "=", input.id)
        .where("userId", "=", userId)
        .selectAll()
        .executeTakeFirst();

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Get order items
      const orderItems = await db.selectFrom("OrderItem")
        .where("orderId", "=", order.id)
        .leftJoin("Product", "Product.id", "OrderItem.productId")
        .selectAll()
        .execute();

      return {
        ...order,
        orderItems,
      };
    }),

  // Create a new order
  createOrder: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId as string;

      return await db.transaction().execute(async (trx) => {
        // Create the order
        const [newOrder] = await trx.insertInto("Order")
          .values({
            id: crypto.randomUUID(),
            userId,
            status: "pending",
            totalAmount: input.totalAmount,
            paymentMethod: input.paymentMethod,
            shippingAddress: input.shippingAddress,
            billingAddress: input.billingAddress || input.shippingAddress,
            notes: input.notes || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning(["id"])
          .execute();

        if (!newOrder || !newOrder.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create order",
          });
        }

        // Create order items
        for (const item of input.items) {
          // First check if the product exists and has stock
          const product = await trx.selectFrom("Product")
            .where("id", "=", item.productId)
            .selectAll()
            .executeTakeFirst();

          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Product with ID ${item.productId} not found`,
            });
          }

          // Check if there's enough stock
          if (product.stock && product.stock.quantity < item.quantity) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Not enough stock for product ${product.name}`,
            });
          }

          // Create the order item
          await trx.insertInto("OrderItem").values({
            id: crypto.randomUUID(),
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.price,
            createdAt: new Date(),
            updatedAt: new Date(),
          }).execute();

          // Update the product stock if available
          if (product.stock) {
            await trx.updateTable("Product")
              .set({
                stock: {
                  ...product.stock,
                  quantity: product.stock.quantity - item.quantity,
                },
                updatedAt: new Date(),
              })
              .where("id", "=", product.id)
              .execute();
          }
        }

        // Get the complete order with items
        const completeOrder = await trx.selectFrom("Order")
          .where("id", "=", newOrder.id)
          .selectAll()
          .executeTakeFirst();

        const orderItems = await trx.selectFrom("OrderItem")
          .where("orderId", "=", newOrder.id)
          .leftJoin("Product", "Product.id", "OrderItem.productId")
          .selectAll()
          .execute();

        return {
          ...completeOrder,
          orderItems,
        };
      });
    }),

  // Cancel an order
  cancelOrder: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId as string;

      // Get the order
      const order = await db.selectFrom("Order")
        .where("id", "=", input.orderId)
        .where("userId", "=", userId)
        .selectAll()
        .executeTakeFirst();

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Check if the order can be cancelled
      if (order.status !== "pending" && order.status !== "processing") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot cancel an order with status: ${order.status}`,
        });
      }

      // Get order items
      const orderItems = await db.selectFrom("OrderItem")
        .where("orderId", "=", order.id)
        .selectAll()
        .execute();

      // Cancel the order in a transaction
      return await db.transaction().execute(async (trx) => {
        // Update order status
        await trx.updateTable("Order")
          .set({ 
            status: "cancelled",
            updatedAt: new Date(),
          })
          .where("id", "=", input.orderId)
          .execute();

        // Restore product inventory
        for (const item of orderItems) {
          const product = await trx.selectFrom("Product")
            .where("id", "=", item.productId)
            .selectAll()
            .executeTakeFirst();

          if (product && product.stock) {
            await trx.updateTable("Product")
              .set({
                stock: {
                  ...product.stock,
                  quantity: product.stock.quantity + item.quantity,
                },
                updatedAt: new Date(),
              })
              .where("id", "=", item.productId)
              .execute();
          }
        }

        // Get the updated order
        const updatedOrder = await trx.selectFrom("Order")
          .where("id", "=", input.orderId)
          .selectAll()
          .executeTakeFirst();
          
        return updatedOrder;
      });
    }),
});
