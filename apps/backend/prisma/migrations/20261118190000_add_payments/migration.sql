ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'FAILED';

ALTER TABLE "payments"
  ALTER COLUMN "student_id" DROP NOT NULL,
  ALTER COLUMN "catalog_item_id" DROP NOT NULL,
  ALTER COLUMN "phone_number" DROP NOT NULL,
  ALTER COLUMN "amount_brl" DROP NOT NULL,
  ALTER COLUMN "coins_spent" DROP NOT NULL;

ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "provider_status" TEXT,
  ADD COLUMN IF NOT EXISTS "amount" DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS "external_reference" TEXT,
  ADD COLUMN IF NOT EXISTS "external_id" TEXT;

CREATE TABLE IF NOT EXISTS "payment_events" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT,
    "providerEventId" TEXT NOT NULL,
    "action" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payment_events_providerEventId_key" ON "payment_events"("providerEventId");
CREATE INDEX IF NOT EXISTS "payment_events_paymentId_idx" ON "payment_events"("paymentId");

-- AddForeignKey
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
