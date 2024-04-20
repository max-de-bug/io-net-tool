-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "OauthUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_OauthUserId_fkey" FOREIGN KEY ("OauthUserId") REFERENCES "OauthUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
