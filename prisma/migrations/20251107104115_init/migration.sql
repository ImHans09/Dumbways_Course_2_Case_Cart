/*
  Warnings:

  - The values [ADMIN,SUPPLIER,CUSTOMER] on the enum `userrole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "userrole_new" AS ENUM ('admin', 'customer', 'supplier');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "userrole_new" USING ("role"::text::"userrole_new");
ALTER TYPE "userrole" RENAME TO "userrole_old";
ALTER TYPE "userrole_new" RENAME TO "userrole";
DROP TYPE "public"."userrole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'customer';
COMMIT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'customer';
