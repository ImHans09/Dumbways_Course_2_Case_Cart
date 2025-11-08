/*
  Warnings:

  - You are about to drop the column `point` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_products_in_orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stocks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suppliers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPPLIER', 'CUSTOMER');

-- DropForeignKey
ALTER TABLE "public"."_products_in_orders" DROP CONSTRAINT "_products_in_orders_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_products_in_orders" DROP CONSTRAINT "_products_in_orders_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."products" DROP CONSTRAINT "products_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."stocks" DROP CONSTRAINT "stocks_product_id_fkey";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "point",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';

-- DropTable
DROP TABLE "public"."_products_in_orders";

-- DropTable
DROP TABLE "public"."orders";

-- DropTable
DROP TABLE "public"."stocks";

-- DropTable
DROP TABLE "public"."suppliers";

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
