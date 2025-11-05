import { Prisma, PrismaClient } from "@prisma/client";

// Initialize Prisma
const prisma = Prisma;

// Create instance of PrismaClient
const prismaClient = new PrismaClient();

// Export the variables
export {
  prisma,
  prismaClient
};