/*
  Warnings:

  - You are about to drop the `forum_replies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forums` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[rg]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `concept` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "forum_replies" DROP CONSTRAINT "forum_replies_authorId_fkey";

-- DropForeignKey
ALTER TABLE "forum_replies" DROP CONSTRAINT "forum_replies_forumId_fkey";

-- DropForeignKey
ALTER TABLE "forums" DROP CONSTRAINT "forums_authorId_fkey";

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "concept" TEXT NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "rg" TEXT;

-- DropTable
DROP TABLE "forum_replies";

-- DropTable
DROP TABLE "forums";

-- DropEnum
DROP TYPE "Subjects";

-- CreateIndex
CREATE INDEX "questions_subject_concept_idx" ON "questions"("subject", "concept");

-- CreateIndex
CREATE UNIQUE INDEX "users_rg_key" ON "users"("rg");
