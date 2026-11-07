/*
  Warnings:

  - The `concept` column on the `questions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `subject` column on the `questions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "questions_subject_concept_idx";

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "concept",
ADD COLUMN     "concept" TEXT[],
DROP COLUMN "subject",
ADD COLUMN     "subject" TEXT[];
