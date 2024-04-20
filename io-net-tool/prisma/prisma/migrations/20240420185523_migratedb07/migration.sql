/*
  Warnings:

  - The primary key for the `OauthUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Server" DROP CONSTRAINT "Server_OauthUserId_fkey";

-- DropForeignKey
ALTER TABLE "Server" DROP CONSTRAINT "Server_userId_fkey";

-- AlterTable
ALTER TABLE "OauthUser" DROP CONSTRAINT "OauthUser_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "OauthUser_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "OauthUser_id_seq";

-- AlterTable
ALTER TABLE "Server" ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "OauthUserId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_OauthUserId_fkey" FOREIGN KEY ("OauthUserId") REFERENCES "OauthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
