/*
  Warnings:

  - You are about to drop the column `schoolname` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `schoolname` on the `teacher_profiles` table. All the data in the column will be lost.
  - Added the required column `schoolId` to the `student_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `teacher_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."student_profiles" DROP CONSTRAINT "student_profiles_schoolname_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_profiles" DROP CONSTRAINT "teacher_profiles_schoolname_fkey";

-- AlterTable
ALTER TABLE "public"."student_profiles" DROP COLUMN "schoolname",
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."teacher_profiles" DROP COLUMN "schoolname",
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."student_profiles" ADD CONSTRAINT "student_profiles_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_profiles" ADD CONSTRAINT "teacher_profiles_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attempts" ADD CONSTRAINT "attempts_MarkedAnswer_Id_fkey" FOREIGN KEY ("MarkedAnswer_Id") REFERENCES "public"."alternatives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
