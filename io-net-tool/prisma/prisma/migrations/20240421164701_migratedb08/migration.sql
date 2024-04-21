/*
  Warnings:

  - You are about to drop the column `OauthUserId` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the `OauthUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Server" DROP CONSTRAINT "Server_OauthUserId_fkey";

-- AlterTable
ALTER TABLE "Server" DROP COLUMN "OauthUserId";

-- DropTable
DROP TABLE "OauthUser";
