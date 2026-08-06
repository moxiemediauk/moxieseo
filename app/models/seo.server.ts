import { PrismaClient, ResourceType } from "@prisma/client";
import prisma from "../db.server";

// GraphQL query to fetch product SEO details from Shopify
const GET_PRODUCT_SEO_QUERY = `#graphql
  query getProductSeo($id: ID!) {
    product(id: $id) {
      id
      title
      descriptionHtml
      handle
      seo {
        title
        description
      }
    }
  }
`;

// GraphQL mutation to update product SEO details in Shopify
const UPDATE_PRODUCT_SEO_MUTATION = `#graphql
  mutation updateProductSeo($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        seo {
          title
          description
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface ProductSeoData {
  id: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
}

/**
 * Fetches product SEO metadata from Shopify GraphQL API and syncs it with PostgreSQL.
 */
export async function syncProductSeoFromShopify({
  admin,
  shop,
  productId,
}: {
  admin: any;
  shop: string;
  productId: string;
}) {
  const response = await admin.graphql(GET_PRODUCT_SEO_QUERY, {
    variables: { id: productId },
  });

  const responseJson = await response.json();
  const product = responseJson.data?.product;

  if (!product) {
    throw new Error(`Product not found for ID: ${productId}`);
  }

  const seoTitle = product.seo?.title || null;
  const seoDescription = product.seo?.description || null;

  // Upsert the record into Postgres via Prisma
  const metaOverride = await prisma.metaOverride.upsert({
    where: {
      shop_resourceId: {
        shop,
        resourceId: product.id,
      },
    },
    update: {
      title: seoTitle,
      description: seoDescription,
    },
    create: {
      shop,
      resourceId: product.id,
      resourceType: ResourceType.PRODUCT,
      title: seoTitle,
      description: seoDescription,
    },
  });

  return {
    product,
    metaOverride,
  };
}

/**
 * Updates product SEO fields in Shopify via Admin GraphQL and syncs with PostgreSQL.
 */
export async function updateProductSeo({
  admin,
  shop,
  productId,
  seoTitle,
  seoDescription,
  canonicalUrl,
  noIndex,
  noFollow,
}: {
  admin: any;
  shop: string;
  productId: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}) {
  // 1. Push changes to Shopify Admin GraphQL API
  const response = await admin.graphql(UPDATE_PRODUCT_SEO_MUTATION, {
    variables: {
      input: {
        id: productId,
        seo: {
          title: seoTitle || null,
          description: seoDescription || null,
        },
      },
    },
  });

  const responseJson = await response.json();
  const userErrors = responseJson.data?.productUpdate?.userErrors;

  if (userErrors && userErrors.length > 0) {
    throw new Error(
      `Shopify GraphQL Error: ${userErrors.map((e: any) => e.message).join(", ")}`
    );
  }

  // 2. Sync updated values into PostgreSQL
  const metaOverride = await prisma.metaOverride.upsert({
    where: {
      shop_resourceId: {
        shop,
        resourceId: productId,
      },
    },
    update: {
      title: seoTitle || null,
      description: seoDescription || null,
      canonicalUrl: canonicalUrl || null,
      noIndex: noIndex ?? false,
      noFollow: noFollow ?? false,
    },
    create: {
      shop,
      resourceId: productId,
      resourceType: ResourceType.PRODUCT,
      title: seoTitle || null,
      description: seoDescription || null,
      canonicalUrl: canonicalUrl || null,
      noIndex: noIndex ?? false,
      noFollow: noFollow ?? false,
    },
  });

  return metaOverride;
}