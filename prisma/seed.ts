import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clear existing data
  await prisma.review.deleteMany();
  await prisma.image.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();
  console.log("Cleared existing data.");

  // 2. Create fake users
  const users = await Promise.all(
    Array.from({ length: 3 }).map((_, index) =>
      prisma.user.create({
        data: {
          clerkId: `user_placeholder_${index + 1}`,
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          imageUrl: faker.image.avatar(),
        },
      }),
    ),
  );
  console.log(`Created ${users.length} users.`);

  // 3. Create fake listings with images
  const listings = [];
  for (const user of users) {
    for (let i = 0; i < 4; i++) {
      // Create 4 listings per user
      const listing = await prisma.listing.create({
        data: {
          title: faker.lorem.sentence(5),
          description: faker.lorem.paragraphs(3),
          price: faker.commerce.price({ min: 50, max: 500 }),
          latitude: parseFloat(
            faker.location
              .latitude({ min: 44.4, max: 44.5, precision: 6 })
              .toString(),
          ),
          longitude: parseFloat(
            faker.location
              .longitude({ min: 26.0, max: 26.2, precision: 6 })
              .toString(),
          ),
          authorId: user.clerkId,
          images: {
            create: Array.from({
              length: faker.number.int({ min: 2, max: 5 }),
            }).map(() => ({
              url: faker.image.url(),
            })),
          },
        },
      });
      listings.push(listing);
    }
  }
  console.log(`Created ${listings.length} listings with images.`);

  // 4. Create fake reviews
  for (const listing of listings) {
    // Each listing gets 1-2 reviews from different users
    const reviewers = faker.helpers
      .shuffle(users)
      .slice(0, faker.number.int({ min: 1, max: 2 }));
    for (const reviewer of reviewers) {
      // Prevent users from reviewing their own listings in the seed
      if (reviewer.clerkId !== listing.authorId) {
        await prisma.review.create({
          data: {
            rating: faker.number.int({ min: 3, max: 5 }),
            comment: faker.lorem.paragraph(),
            authorId: reviewer.clerkId,
            listingId: listing.id,
          },
        });
      }
    }
  }
  console.log("Created reviews.");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
