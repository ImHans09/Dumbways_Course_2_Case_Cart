import { prismaClient } from "./client.js";

async function main() {
  // Truncate old records from table

  // Create users data for seeding

  // Initialize orders data
}

main()
  .then(() => {
    console.log('Seeding completed');
  })
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });