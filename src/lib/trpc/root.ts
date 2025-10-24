import { listingsRouter } from "./routers/listings";
import { router } from "./server";

export const appRouter = router({
  listings: listingsRouter,
});

export type AppRouter = typeof appRouter;
