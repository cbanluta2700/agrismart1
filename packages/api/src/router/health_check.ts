import { z } from "zod";
import { db, dbInfo } from "@saasfly/db";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const helloRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
        time: new Date().toISOString(),
      };
    }),
  dbCheck: publicProcedure.query(async () => {
    try {
      // Simple query to check database connection
      const result = await db.selectFrom('User').select('id').limit(1).execute();
      
      // Get database stats
      return {
        success: true,
        message: "Database connection successful",
        connectionInfo: {
          isNeon: dbInfo.isNeon,
          url: dbInfo.connectionUrl.replace(/:[^:]*@/, ':****@'),
        },
        stats: {
          usersCount: result.length,
          timestamp: new Date().toISOString(),
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
        connectionInfo: {
          isNeon: dbInfo.isNeon,
          url: dbInfo.connectionUrl.replace(/:[^:]*@/, ':****@'),
        },
      };
    }
  }),
});
