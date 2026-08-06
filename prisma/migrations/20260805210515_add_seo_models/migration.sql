-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PRODUCT', 'COLLECTION', 'PAGE', 'ARTICLE', 'HOMEPAGE');

-- CreateEnum
CREATE TYPE "SchemaType" AS ENUM ('ORGANIZATION', 'PRODUCT', 'BREADCRUMB', 'FAQ', 'ARTICLE', 'LOCAL_BUSINESS');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaOverride" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "noFollow" BOOLEAN NOT NULL DEFAULT false,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JsonLdSchema" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "schemaType" "SchemaType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB NOT NULL,
    "resourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JsonLdSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AltTextJob" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "pattern" TEXT NOT NULL,
    "totalImages" INTEGER NOT NULL DEFAULT 0,
    "updatedImages" INTEGER NOT NULL DEFAULT 0,
    "failedImages" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AltTextJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaOverride_shop_idx" ON "MetaOverride"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "MetaOverride_shop_resourceId_key" ON "MetaOverride"("shop", "resourceId");

-- CreateIndex
CREATE INDEX "JsonLdSchema_shop_idx" ON "JsonLdSchema"("shop");

-- CreateIndex
CREATE INDEX "AltTextJob_shop_idx" ON "AltTextJob"("shop");
