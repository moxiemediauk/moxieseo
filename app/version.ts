export interface ChangelogEntry {
  version: string;
  date: string;
  status: "Current" | "Previous";
  changes: string[];
}

export const APP_VERSION = "1.0.0";

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2026-08-06",
    status: "Current",
    changes: [
      "Initial release of Moxie SEO dashboard.",
      "Added products list table connected to Shopify Admin GraphQL.",
      "Added Meta Title and Meta Description inspection column views.",
      "Added character length counts and 'Not set' status badges.",
    ],
  },
];