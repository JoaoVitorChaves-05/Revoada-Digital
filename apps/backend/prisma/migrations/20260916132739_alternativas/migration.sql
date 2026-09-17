-- CreateTable
CREATE TABLE "public"."alternatives" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "Correct" BOOLEAN NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "alternatives_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."alternatives" ADD CONSTRAINT "alternatives_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
