-- CreateEnum
DO $$
BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "recharge_catalog_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount_brl" DECIMAL(10,2) NOT NULL,
    "coins_cost" INTEGER NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recharge_catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "catalog_item_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "amount_brl" DECIMAL(10,2) NOT NULL,
    "coins_spent" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "external_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);
