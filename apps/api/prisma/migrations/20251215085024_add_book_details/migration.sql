/*
  Warnings:

  - You are about to drop the column `imageUrls` on the `Book` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "BookStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "imageUrls",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'ru',
ADD COLUMN     "publishYear" INTEGER;
