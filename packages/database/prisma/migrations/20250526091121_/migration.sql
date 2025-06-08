/*
  Warnings:

  - You are about to drop the column `departmentId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DepartmentMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[teamId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teamId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'AGENT');

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_timezoneId_fkey";

-- DropForeignKey
ALTER TABLE "DepartmentMember" DROP CONSTRAINT "DepartmentMember_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "DepartmentMember" DROP CONSTRAINT "DepartmentMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_departmentId_fkey";

-- DropIndex
DROP INDEX "Subscription_departmentId_key";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "departmentId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "DepartmentMember";

-- DropEnum
DROP TYPE "DepartmentRole";

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "timezoneId" TEXT DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL,
    "employeeId" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_teamId_key" ON "Subscription"("teamId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_timezoneId_fkey" FOREIGN KEY ("timezoneId") REFERENCES "timezones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
