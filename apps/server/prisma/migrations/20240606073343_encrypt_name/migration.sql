/*
  Warnings:

  - You are about to drop the column `name` on the `Document` table. All the data in the column will be lost.
  - Added the required column `nameCiphertext` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameCommitment` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameNonce` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "name",
ADD COLUMN     "nameCiphertext" TEXT NOT NULL,
ADD COLUMN     "nameCommitment" TEXT NOT NULL,
ADD COLUMN     "nameNonce" TEXT NOT NULL;
