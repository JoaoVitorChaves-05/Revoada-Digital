/*
  Warnings:

  - You are about to drop the column `Correct` on the `alternatives` table. All the data in the column will be lost.
  - You are about to drop the column `MarkedAnswer_Id` on the `attempts` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `attempts` table. All the data in the column will be lost.
  - You are about to drop the column `Level` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `QStem` on the `questions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[text]` on the table `questions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isCorrect` to the `alternatives` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `mock_exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'ABANDONED');

-- DropForeignKey
ALTER TABLE "public"."attempts" DROP CONSTRAINT "attempts_MarkedAnswer_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."attempts" DROP CONSTRAINT "attempts_questionId_fkey";

-- DropIndex
DROP INDEX "public"."questions_QStem_key";

-- AlterTable
ALTER TABLE "public"."alternatives" DROP COLUMN "Correct",
ADD COLUMN     "isCorrect" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "public"."attempts" DROP COLUMN "MarkedAnswer_Id",
DROP COLUMN "questionId",
ADD COLUMN     "correctAnswers" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "earnedPoints" INTEGER,
ADD COLUMN     "score" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "public"."AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "totalQuestions" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."mock_exams" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."questions" DROP COLUMN "Level",
DROP COLUMN "QStem",
ADD COLUMN     "difficulty" INTEGER NOT NULL,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "text" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."mock_exam_questions" (
    "mockExamId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "mock_exam_questions_pkey" PRIMARY KEY ("mockExamId","questionId")
);

-- CreateTable
CREATE TABLE "public"."attempt_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedAlternativeId" TEXT,
    "isCorrect" BOOLEAN,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mock_exam_questions_mockExamId_position_key" ON "public"."mock_exam_questions"("mockExamId", "position");

-- CreateIndex
CREATE INDEX "attempt_answers_questionId_idx" ON "public"."attempt_answers"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "attempt_answers_attemptId_questionId_key" ON "public"."attempt_answers"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "attempts_mockExamId_idx" ON "public"."attempts"("mockExamId");

-- CreateIndex
CREATE INDEX "mock_exams_studentId_idx" ON "public"."mock_exams"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "questions_text_key" ON "public"."questions"("text");

-- AddForeignKey
ALTER TABLE "public"."mock_exam_questions" ADD CONSTRAINT "mock_exam_questions_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "public"."mock_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mock_exam_questions" ADD CONSTRAINT "mock_exam_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attempt_answers" ADD CONSTRAINT "attempt_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attempt_answers" ADD CONSTRAINT "attempt_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attempt_answers" ADD CONSTRAINT "attempt_answers_selectedAlternativeId_fkey" FOREIGN KEY ("selectedAlternativeId") REFERENCES "public"."alternatives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
