import { useState } from "react";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  BlockStack,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { updateProductSeo, syncProductSeoFromShopify } from "../models/seo.server";
import prisma from "../db.server";

// -----------------------------------------------------------------------------
// 1. LOADER: Fetch sample/selected product and existing database record
// -----------------------------------------------------------------------------
export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  // Fetch the first 5 products from Shopify Admin GraphQL
  const response = await admin.graphql(`#graphql
    query getProducts {
      products(first: 5) {
        nodes {
          id
          title
          handle
          seo {
            title
            description
          }
        }
      }
    }
  `);

  const responseJson = await response.json();
  const products = responseJson.data?.products?.nodes || [];

  // Get local PostgreSQL overrides for these products
  const overrides = await prisma.metaOverride.findMany({
    where: { shop: session.shop },
  });

  return json({ products, overrides });
}

// -----------------------------------------------------------------------------
// 2. ACTION: Handle Form Submission and execute updateProductSeo
// -----------------------------------------------------------------------------
export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();

  const productId = formData.get("productId") as string;
  const seoTitle = formData.get("seoTitle") as string;
  const seoDescription = formData.get("seoDescription") as string;

  try {
    const updatedMeta = await updateProductSeo({
      admin,
      shop: session.shop,
      productId,
      seoTitle,
      seoDescription,
    });

    return json({ success: true, updatedMeta, error: null });
  } catch (error: any) {
    return json({ success: false, updatedMeta: null, error: error.message }, { status: 400 });
  }
}

// -----------------------------------------------------------------------------
// 3. UI COMPONENT: Render the Polaris Form & Live Preview
// -----------------------------------------------------------------------------
export default function SeoEditorRoute() {
  const { products } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const selectedProduct = products[0]; // Example: target the first product

  const [title, setTitle] = useState(selectedProduct?.seo?.title || selectedProduct?.title || "");
  const [description, setDescription] = useState(selectedProduct?.seo?.description || "");

  const handleSubmit = () => {
    if (!selectedProduct) return;
    submit(
      {
        productId: selectedProduct.id,
        seoTitle: title,
        seoDescription: description,
      },
      { method: "post" }
    );
  };

  return (
    <Page title="Moxie SEO — Product Editor">
      <Layout>
        {actionData?.success && (
          <Layout.Section>
            <Banner title="SEO Metadata updated successfully!" tone="success" />
          </Layout.Section>
        )}

        {actionData?.error && (
          <Layout.Section>
            <Banner title="Failed to update SEO Metadata" tone="critical">
              <p>{actionData.error}</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Editing: {selectedProduct?.title || "No Product Found"}
              </Text>
              
              <FormLayout>
                <TextField
                  label="Meta Title"
                  value={title}
                  onChange={(val) => setTitle(val)}
                  autoComplete="off"
                  helpText={`${title.length}/60 characters recommended`}
                />
                <TextField
                  label="Meta Description"
                  value={description}
                  onChange={(val) => setDescription(val)}
                  multiline={3}
                  autoComplete="off"
                  helpText={`${description.length}/160 characters recommended`}
                />
                <Button variant="primary" onClick={handleSubmit}>
                  Save to Shopify & Local Database
                </Button>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}