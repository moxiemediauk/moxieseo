export interface ChangelogEntry {
  version: string;
  date: string;
  status: "Current" | "Previous";
  changes: string[];
}

export const APP_VERSION = "1.0.2";

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.2",
    date: "2026-08-06",
    status: "Current",
    changes: [
      'Added filter for title or description',
      'Added "Suggested title" or "Suggested description"',
      'Added link to product specific page',
    ],
  },
  {
    version: "1.0.1",
    date: "2026-08-06",
    status: "Previous",
    changes: [
      "Added dev banner indicator badge in local development mode.",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-08-06",
    status: "Previous",
    changes: [
      "Initial release of Moxie SEO dashboard.",
      "Added products list table connected to Shopify Admin GraphQL.",
      "Added Meta Title and Meta Description inspection column views.",
      "Added character length counts and 'Not set' status badges.",
    ],
  },
];