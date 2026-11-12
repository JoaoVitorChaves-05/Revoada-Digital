-- CreateTable
CREATE TABLE "point_balances" (
    "studentId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "point_balances_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_studentId_createdAt_idx" ON "transactions"("studentId", "createdAt");

-- AddForeignKey
ALTER TABLE "point_balances" ADD CONSTRAINT "point_balances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "point_balances"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE;
