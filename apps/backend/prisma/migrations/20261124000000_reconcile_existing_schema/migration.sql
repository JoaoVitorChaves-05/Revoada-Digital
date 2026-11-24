ALTER TABLE "attempts"
  ADD COLUMN IF NOT EXISTS "coinsCredited" BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'externalId'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'external_id'
  ) THEN
    ALTER TABLE "payments" RENAME COLUMN "externalId" TO "external_id";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'externalId'
  ) THEN
    UPDATE "payments"
      SET "external_id" = COALESCE("external_id", "externalId")
      WHERE "externalId" IS NOT NULL;
    ALTER TABLE "payments" DROP COLUMN "externalId";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'providerStatus'
  ) THEN
    ALTER TABLE "payments"
      ADD COLUMN IF NOT EXISTS "provider_status" TEXT;
    UPDATE "payments"
      SET "provider_status" = COALESCE("provider_status", "providerStatus")
      WHERE "providerStatus" IS NOT NULL;
    ALTER TABLE "payments" DROP COLUMN "providerStatus";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'externalReference'
  ) THEN
    ALTER TABLE "payments"
      ADD COLUMN IF NOT EXISTS "external_reference" TEXT;
    UPDATE "payments"
      SET "external_reference" = COALESCE("external_reference", "externalReference")
      WHERE "externalReference" IS NOT NULL;
    ALTER TABLE "payments" DROP COLUMN "externalReference";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'createdAt'
  ) THEN
    ALTER TABLE "payments"
      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    UPDATE "payments"
      SET "created_at" = COALESCE("created_at", "createdAt")
      WHERE "createdAt" IS NOT NULL;
    ALTER TABLE "payments" DROP COLUMN "createdAt";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "payments"
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    UPDATE "payments"
      SET "updated_at" = COALESCE("updated_at", "updatedAt")
      WHERE "updatedAt" IS NOT NULL;
    ALTER TABLE "payments" DROP COLUMN "updatedAt";
  END IF;
END $$;

ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "amount_brl" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "catalog_item_id" TEXT,
  ADD COLUMN IF NOT EXISTS "coins_spent" INTEGER,
  ADD COLUMN IF NOT EXISTS "phone_number" TEXT,
  ADD COLUMN IF NOT EXISTS "student_id" TEXT;

ALTER TABLE "payments"
  ALTER COLUMN "amount_brl" DROP NOT NULL,
  ALTER COLUMN "student_id" DROP NOT NULL,
  ALTER COLUMN "catalog_item_id" DROP NOT NULL,
  ALTER COLUMN "phone_number" DROP NOT NULL,
  ALTER COLUMN "coins_spent" DROP NOT NULL;

DROP INDEX IF EXISTS "payments_externalId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "payments_external_id_key"
  ON "payments"("external_id");
CREATE INDEX IF NOT EXISTS "payments_student_id_created_at_idx"
  ON "payments"("student_id", "created_at");
CREATE INDEX IF NOT EXISTS "payments_status_created_at_idx"
  ON "payments"("status", "created_at");

CREATE TABLE IF NOT EXISTS "rewards" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "points_cost" INTEGER NOT NULL,
  "is_available" BOOLEAN NOT NULL DEFAULT true,
  "stock" INTEGER,
  CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "redemptions" (
  "id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "reward_id" TEXT NOT NULL,
  "points_spent" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "redemptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "redemptions_student_id_created_at_idx"
  ON "redemptions"("student_id", "created_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_student_id_fkey'
      AND conrelid = '"payments"'::regclass
  ) THEN
    ALTER TABLE "payments"
      ADD CONSTRAINT "payments_student_id_fkey"
      FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_catalog_item_id_fkey'
      AND conrelid = '"payments"'::regclass
  ) THEN
    ALTER TABLE "payments"
      ADD CONSTRAINT "payments_catalog_item_id_fkey"
      FOREIGN KEY ("catalog_item_id") REFERENCES "recharge_catalog_items"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'redemptions_student_id_fkey'
      AND conrelid = '"redemptions"'::regclass
  ) THEN
    ALTER TABLE "redemptions"
      ADD CONSTRAINT "redemptions_student_id_fkey"
      FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'redemptions_reward_id_fkey'
      AND conrelid = '"redemptions"'::regclass
  ) THEN
    ALTER TABLE "redemptions"
      ADD CONSTRAINT "redemptions_reward_id_fkey"
      FOREIGN KEY ("reward_id") REFERENCES "rewards"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
