/*
  Warnings:

  - Made the column `metadata` on table `triggerRun` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."triggerRun" ALTER COLUMN "metadata" SET NOT NULL;
