/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "userrole" AS ENUM ('ADMIN', 'SUPPLIER', 'CUSTOMER');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "userrole" NOT NULL DEFAULT 'CUSTOMER';

-- DropEnum
DROP TYPE "public"."UserRole";
