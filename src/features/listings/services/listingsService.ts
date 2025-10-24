import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { Listing } from "@prisma/client";

const CACHE_KEY = "popular-listings";
const CACHE_TTL_SECONDS = 3600;

export async function getPopularListings(): Promise<Listing[]> {
  // 1. Try to get from cache
  const cachedListings = await redis.get<Listing[]>(CACHE_KEY);
  if (cachedListings) {
    console.log("CACHE HIT for popular listings");
    return cachedListings;
  }

  // 2. If miss, get from DB
  console.log("CACHE MISS for popular listings");
  const listings = await db.listing.findMany({
    orderBy: { reviews: { _count: "desc" } },
    take: 10,
  });

  // 3. Set in cache for next time
  await redis.set(CACHE_KEY, listings, { ex: CACHE_TTL_SECONDS });

  return listings;
}
