-- DropForeignKey
ALTER TABLE "public"."triggerRun" DROP CONSTRAINT "triggerRun_triggerId_fkey";

-- AddForeignKey
ALTER TABLE "public"."triggerRun" ADD CONSTRAINT "triggerRun_triggerId_fkey" FOREIGN KEY ("triggerId") REFERENCES "public"."trigger"("id") ON DELETE CASCADE ON UPDATE CASCADE;
