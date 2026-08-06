import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import { Badge, Box, InlineStack, Text } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    isDev: process.env.NODE_ENV === "development",
  };
};

export default function App() {
  const { apiKey, isDev } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      {isDev && (
        <Box
          padding="200"
          background="bg-surface-warning"
          borderBlockEndWidth="025"
          borderColor="border-warning"
        >
          <InlineStack align="center" blockAlign="center" gap="200">
            <Badge tone="warning">LOCAL DEV</Badge>
            <Text as="span" variant="bodySm" fontWeight="bold">
              Development Environment
            </Text>
          </InlineStack>
        </Box>
      )}
      <NavMenu>
        <a href="/app" rel="home">Home</a>
        <a href="/app/seo-editor">SEO Editor</a>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};