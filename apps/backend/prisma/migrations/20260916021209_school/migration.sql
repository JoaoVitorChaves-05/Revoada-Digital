/*
  Warnings:

  - You are about to drop the column `school` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `school` on the `teacher_profiles` table. All the data in the column will be lost.
  - Added the required column `schoolname` to the `student_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolname` to the `teacher_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."student_profiles" DROP COLUMN "school",
ADD COLUMN     "schoolname" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."teacher_profiles" DROP COLUMN "school",
ADD COLUMN     "schoolname" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_key" ON "public"."schools"("name");

-- AddForeignKey
ALTER TABLE "public"."student_profiles" ADD CONSTRAINT "student_profiles_schoolname_fkey" FOREIGN KEY ("schoolname") REFERENCES "public"."schools"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_profiles" ADD CONSTRAINT "teacher_profiles_schoolname_fkey" FOREIGN KEY ("schoolname") REFERENCES "public"."schools"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
