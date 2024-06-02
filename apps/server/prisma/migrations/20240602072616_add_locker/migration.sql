/*
  Warnings:

  - You are about to drop the column `lala` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lala";

-- CreateTable
CREATE TABLE "UserLocker" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clock" INTEGER NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "commitment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLocker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLocker_userId_clock_key" ON "UserLocker"("userId", "clock");

-- AddForeignKey
ALTER TABLE "UserLocker" ADD CONSTRAINT "UserLocker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
