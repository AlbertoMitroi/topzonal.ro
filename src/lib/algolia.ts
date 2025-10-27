import { algoliasearch } from "algoliasearch";
import { Listing } from "@prisma/client";

if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_KEY) {
  throw new Error("Algolia credentials are not set in .env");
}

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY,
);

const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!;

type ListingIndex = {
  objectID: string;
  title: string;
  description: string;
  price: number;
  _geoloc: {
    lat: number;
    lng: number;
  };
};

export const syncListingToAlgolia = async (listing: Listing) => {
  const algoliaObject: ListingIndex = {
    objectID: listing.id,
    title: listing.title,
    description: listing.description,
    price: Number(listing.price),
    _geoloc: {
      lat: listing.latitude,
      lng: listing.longitude,
    },
  };

  await client.saveObject({
    indexName,
    body: algoliaObject,
  });
};

export const deleteListingFromAlgolia = async (listingId: string) => {
  await client.deleteObject({
    indexName,
    objectID: listingId,
  });
};

export { client, indexName };
