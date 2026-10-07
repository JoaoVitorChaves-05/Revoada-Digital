/*
  Make school optional for student and teacher profiles.
*/
ALTER TABLE "student_profiles" ALTER COLUMN "schoolId" DROP NOT NULL;
ALTER TABLE "teacher_profiles" ALTER COLUMN "schoolId" DROP NOT NULL;
