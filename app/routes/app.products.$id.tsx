import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Badge,
  InlineStack,
  Thumbnail,
  Divider,
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const productId = `gid://shopify/Product/${params.id}`;

  const response = await admin.graphql(
    `#graphql
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        handle
        vendor
        featuredImage {
          url
          altText
        }
        seo {
          title
          description
        }
      }
    }`,
    {
      variables: { id: productId },
    }
  );

  const responseJson = await response.json();
  const product = responseJson.data?.product;

  if (!product) {
    throw new Response("Product Not Found", { status: 404 });
  }

  return json({ product });
};

export default function ProductDetail() {
  const { product } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const metaTitle = product.seo?.title;
  const metaDescription = product.seo?.description;

  return (
    <Page
      backAction={{ content: "Products", onAction: () => navigate("/app") }}
      title={product.title}
      subtitle={`Vendor: ${product.vendor || "N/A"}`}
    >
      <Layout>
        {/* Left Column: Title & Description Detail */}
        <Layout.Section>
          <BlockStack gap="400">
            {/* Meta Title Card */}
            <Card padding="500">
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h2">
                    Meta Title
                  </Text>
                  {metaTitle ? (
                    <Text variant="bodyXs" tone="subdued" as="span">
                      {metaTitle.length} characters
                    </Text>
                  ) : (
                    <Badge tone="attention">Not set</Badge>
                  )}
                </InlineStack>

                <Divider />

                <Text
                  variant="bodyMd"
                  as="p"
                  tone={metaTitle ? undefined : "subdued"}
                >
                  {metaTitle || "No custom meta title specified for this product."}
                </Text>
              </BlockStack>
            </Card>

            {/* Meta Description Card */}
            <Card padding="500">
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h2">
                    Meta Description
                  </Text>
                  {metaDescription ? (
                    <Text variant="bodyXs" tone="subdued" as="span">
                      {metaDescription.length} characters
                    </Text>
                  ) : (
                    <Badge tone="attention">Not set</Badge>
                  )}
                </InlineStack>

                <Divider />

                <Text
                  variant="bodyMd"
                  as="p"
                  tone={metaDescription ? undefined : "subdued"}
                >
                  {metaDescription || "No custom meta description specified for this product."}
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        {/* Right Column: Product Overview */}
        <Layout.Section variant="oneThird">
          <Card padding="400">
            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">
                Product Details
              </Text>
              <Thumbnail
                source={product.featuredImage?.url || ImageIcon}
                alt={product.featuredImage?.altText || product.title}
                size="large"
              />
              <BlockStack gap="100">
                <Text variant="bodySm" fontWeight="bold" as="span">
                  Handle:
                </Text>
                <Text variant="bodySm" tone="subdued" as="span">
                  /{product.handle}
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}