import { authRouter } from "./router/auth";
import { customerRouter } from "./router/customer";
import { helloRouter } from "./router/health_check";
import { k8sRouter } from "./router/k8s";
import { messagesRouter } from "./router/messages";
import { ordersRouter } from "./router/orders";
import { productsRouter } from "./router/products";
import { createTRPCRouter } from "./trpc";

// We're exporting this as appRouter to ensure consistency between edge and regular routes
export const appRouter = createTRPCRouter({
  hello: helloRouter,
  k8s: k8sRouter,
  auth: authRouter,
  customer: customerRouter,
  products: productsRouter,
  orders: ordersRouter,
  messages: messagesRouter,
});

// For backward compatibility
export const edgeRouter = appRouter;
