/*
  Warnings:

  - Made the column `expiresAt` on table `Url` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Url" ALTER COLUMN "expiresAt" SET NOT NULL;
