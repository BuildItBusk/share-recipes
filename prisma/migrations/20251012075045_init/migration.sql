-- CreateTable
CREATE TABLE "public"."recipes" (
    "id" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "formattedText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);
