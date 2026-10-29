-- CreateTable
CREATE TABLE "public"."mock_exams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "mock_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."questions" (
    "id" TEXT NOT NULL,
    "QStem" TEXT NOT NULL,
    "Level" INTEGER NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attempts" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "mockExamId" TEXT NOT NULL,
    "MarkedAnswer_Id" TEXT NOT NULL,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questions_QStem_key" ON "public"."questions"("QStem");

-- AddForeignKey
ALTER TABLE "public"."mock_exams" ADD CONSTRAINT "mock_exams_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attempts" ADD CONSTRAINT "attempts_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attempts" ADD CONSTRAINT "attempts_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "public"."mock_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
