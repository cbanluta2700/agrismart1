import type { NextRequest } from "next/server";
import { initTRPC } from "@trpc/server";
import { getToken, type JWT } from "next-auth/jwt";
import { ZodError } from "zod";

import { transformer } from "./transformer";

interface CreateContextOptions {
  req?: Request | NextRequest | any;
}

interface TRPCContext {
  req: Request | NextRequest | any;
  userId?: string | null;
}

export const createInnerTRPCContext = (opts: CreateContextOptions): TRPCContext => {
  return {
    ...opts,
  };
};

export const createTRPCContext = (opts: { req: Request | NextRequest | any }): TRPCContext => {
  return createInnerTRPCContext({
    req: opts.req,
  });
};

export const t = initTRPC.context<TRPCContext>().create({
  transformer,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const procedure = t.procedure;
export const mergeRouters = t.mergeRouters;

export const protectedProcedure = procedure.use(async (opts) => {
  const { req } = opts.ctx;
  const nreq = req!;
  const jwt = await handler(nreq);
  return opts.next({ ctx: { req, userId: jwt?.id } });
});

async function handler(req: Request | NextRequest | any): Promise<JWT | null> {
  // if using `NEXTAUTH_SECRET` env variable, we detect it, and you won't actually need to `secret`
  // Standard NextRequest or polyfilled Request
  return await getToken({ req: req as any });
}
