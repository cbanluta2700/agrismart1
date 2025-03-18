import {
  httpLink,
  type HTTPHeaders,
  type TRPCLink,
  loggerLink,
} from "@trpc/client";
import { proxy } from "valtio";
import superjson from "superjson";

import type { AppRouter } from "@saasfly/api";

import { env } from "~/env.mjs";

/**
 * This is the state that is shared between client components
 * It syncs the logged in user state between client components
 */
export const globalState = proxy({
  user: null as any,
});

export { transformer } from "@saasfly/api/transformer";
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // browser should use relative path
    return "";
  }
  if (process.env.VERCEL_URL) {
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.RENDER_INTERNAL_HOSTNAME) {
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  }
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

const lambdas = [""];

export const endingLink = (opts?: {
  headers?: HTTPHeaders | (() => HTTPHeaders);
}) =>
  ((runtime) => {
    const sharedOpts = {
      headers: opts?.headers,
    };

    const edgeLink = httpLink({
      ...sharedOpts,
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        return {
          ...sharedOpts.headers,
        };
      },
    })(runtime);
    
    const lambdaLink = httpLink({
      ...sharedOpts,
      url: `${getBaseUrl()}/api/trpc/lambda`,
      headers() {
        return {
          ...sharedOpts.headers,
        };
      },
    })(runtime);

    return (ctx) => {
      const path = ctx.op.path.split(".") as [string, ...string[]];
      const endpoint = lambdas.includes(path[0]) ? "lambda" : "edge";

      const newCtx = {
        ...ctx,
        op: { ...ctx.op, path: path.join(".") },
      };
      return endpoint === "edge" ? edgeLink(newCtx) : lambdaLink(newCtx);
    };
  }) satisfies TRPCLink<AppRouter>;

export const externalLinks = [
  loggerLink({
    enabled: () => true,
  }),
];
