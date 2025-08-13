-- CreateEnum
CREATE TYPE "public"."typeOfTrigger" AS ENUM ('Dynamic', 'Textbased');

-- CreateTable
CREATE TABLE "public"."trigger" (
    "id" TEXT NOT NULL,
    "type" "public"."typeOfTrigger" NOT NULL,
    "triggerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "additionalContext" JSONB NOT NULL,

    CONSTRAINT "trigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."triggerRun" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggerId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "triggerRun_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."triggerRun" ADD CONSTRAINT "triggerRun_triggerId_fkey" FOREIGN KEY ("triggerId") REFERENCES "public"."trigger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
