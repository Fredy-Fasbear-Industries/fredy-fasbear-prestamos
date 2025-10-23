-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "reset_password_token" VARCHAR(255),
ADD COLUMN "reset_password_expires" TIMESTAMP(3),
ADD COLUMN "reset_password_used" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_reset_password_token_key" ON "usuarios"("reset_password_token");
