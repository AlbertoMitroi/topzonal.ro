import { initTRPC, TRPCError } from "@trpc/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

// Context creation
const createInnerTRPCContext = async (req: NextRequest) => {
  const auth = getAuth(req);
  return {
    auth,
    db,
  };
};

export const createTRPCContext = async (opts: { req: NextRequest }) => {
  return await createInnerTRPCContext(opts.req);
};

// Initialization
const t = initTRPC.context<typeof createTRPCContext>().create();

// Middleware
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuthed);
