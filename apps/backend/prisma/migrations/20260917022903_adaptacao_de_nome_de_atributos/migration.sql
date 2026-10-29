/*
  Warnings:

  - You are about to drop the column `city` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `schools` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[school_name]` on the table `schools` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `school_city` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_name` to the `schools` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."schools_name_key";

-- AlterTable
ALTER TABLE "public"."schools" DROP COLUMN "city",
DROP COLUMN "name",
ADD COLUMN     "school_city" TEXT NOT NULL,
ADD COLUMN     "school_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "schools_school_name_key" ON "public"."schools"("school_name");
