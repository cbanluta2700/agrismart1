import { loggerLink } from "@trpc/client";
import { experimental_createTRPCNextAppDirClient } from "@trpc/next/app-dir/client";

import type { AppRouter } from "@saasfly/api";

import { transformer } from "./shared";
import { endingLink } from "./shared";

export const trpc = experimental_createTRPCNextAppDirClient<AppRouter>({
  config() {
    return {
      transformer,
      links: [
        loggerLink({
          enabled: (opts) => true,
        }),
        endingLink({
          headers: {
            "x-trpc-source": "client",
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      },
    };
  },
});

export { type RouterInputs, type RouterOutputs } from "@saasfly/api";
