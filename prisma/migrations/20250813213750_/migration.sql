/*
  Warnings:

  - The `additionalContext` column on the `trigger` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."trigger" DROP COLUMN "additionalContext",
ADD COLUMN     "additionalContext" JSONB[];
