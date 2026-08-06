import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  IndexTable,
  Thumbnail,
  Text,
  Badge,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    query getProducts {
      products(first: 50) {
        nodes {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
          seo {
            title
            description
          }
        }
      }
    }`
  );

  const responseJson = await response.json();
  const products = responseJson.data?.products?.nodes || [];

  return json({ products });
};

export default function Index() {
  const { products } = useLoaderData<typeof loader>();

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const rowMarkup = products.map((product: any, index: number) => {
    const metaTitle = product.seo?.title;
    const metaDescription = product.seo?.description;

    return (
      <IndexTable.Row id={product.id} key={product.id} position={index}>
        {/* Product Information */}
        <IndexTable.Cell>
          <InlineStack gap="300" blockAlign="center" wrap={false}>
            <Thumbnail
              source={product.featuredImage?.url || ImageIcon}
              alt={product.featuredImage?.altText || product.title}
              size="small"
            />
            <BlockStack gap="050">
              <Text variant="bodyMd" fontWeight="bold" as="span">
                {product.title}
              </Text>
              <Text variant="bodyXs" tone="subdued" as="span">
                /{product.handle}
              </Text>
            </BlockStack>
          </InlineStack>
        </IndexTable.Cell>

        {/* SEO Element 1: Meta Title */}
        <IndexTable.Cell>
          {metaTitle ? (
            <BlockStack gap="050">
              <Text variant="bodySm" as="p">
                {metaTitle}
              </Text>
              <Text variant="bodyXs" tone="subdued" as="span">
                {metaTitle.length} characters
              </Text>
            </BlockStack>
          ) : (
            <Badge tone="attention">Not set</Badge>
          )}
        </IndexTable.Cell>

        {/* SEO Element 2: Meta Description */}
        <IndexTable.Cell>
          {metaDescription ? (
            <BlockStack gap="050">
              <Text variant="bodySm" as="p">
                {metaDescription}
              </Text>
              <Text variant="bodyXs" tone="subdued" as="span">
                {metaDescription.length} characters
              </Text>
            </BlockStack>
          ) : (
            <Badge tone="attention">Not set</Badge>
          )}
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Page title="Products SEO Data" compactTitle>
      <Card padding="0">
        <IndexTable
          resourceName={resourceName}
          itemCount={products.length}
          selectable={false}
          headings={[
            { title: "Product" },
            { title: "Meta Title" },
            { title: "Meta Description" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
    </Page>
  );
}