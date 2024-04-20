-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "IP" INTEGER NOT NULL,
    "serverName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
