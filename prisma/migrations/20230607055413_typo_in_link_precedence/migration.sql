/*
  Warnings:

  - Changed the type of `linkPrecendence` on the `Contact` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LinkPrecedence" AS ENUM ('PRIMARY', 'SECONDARY');

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "linkPrecendence",
ADD COLUMN     "linkPrecendence" "LinkPrecedence" NOT NULL;

-- DropEnum
DROP TYPE "LinkPrecendence";
