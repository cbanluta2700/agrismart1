import { unstable_noStore as noStore } from "next/cache";

import { db } from "@saasfly/db";

import { createTRPCRouter, protectedProcedure, procedure } from "../trpc";

export const authRouter = createTRPCRouter({
  me: procedure.query(async (opts) => {
    noStore();
    return { ok: true, message: "tRPC working correctly!" };
  }),
  
  mySubscription: protectedProcedure.query(async (opts) => {
    noStore();
    const userId = opts.ctx.userId as string;
    const customer = await db
      .selectFrom("Customer")
      .select(["plan", "stripeCurrentPeriodEnd"])
      .where("authUserId", "=", userId)
      .executeTakeFirst();

    if (!customer) return null;
    return {
      plan: customer.plan,
      endsAt: customer.stripeCurrentPeriodEnd,
    };
  }),
});
