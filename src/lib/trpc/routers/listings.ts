import { z } from "zod";
import { publicProcedure, router } from "../server";
import { db } from "@/lib/db";

export const listingsRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const listing = await db.listing.findUnique({
        where: { id: input.id },
        include: { images: true, reviews: true },
      });
      return listing;
    }),

  getAll: publicProcedure.query(async () => {
    const listings = await db.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return listings;
  }),
});
