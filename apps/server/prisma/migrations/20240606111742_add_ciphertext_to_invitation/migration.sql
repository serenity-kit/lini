/*
  Warnings:

  - Added the required column `ciphertext` to the `DocumentInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DocumentInvitation" ADD COLUMN     "ciphertext" TEXT NOT NULL;
