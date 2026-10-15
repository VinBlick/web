import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const layers = ["app", "views", "widgets", "features", "entities", "shared"];
const slices = {
  views: [
    "home",
    "account",
    "auth",
    "contact",
    "example-report",
    "faq",
    "legal",
    "order",
    "public-report",
  ],
  widgets: [
    "header",
    "footer",
    "hero",
    "pricing",
    "report-sections",
    "report-view",
    "order-status",
  ],
  features: [
    "auth",
    "check-vin",
    "checkout",
    "contact",
    "profile",
    "select-package",
    "share-report",
  ],
  entities: [
    "check",
    "invoice",
    "order",
    "package",
    "report",
    "session",
    "vehicle",
  ],
};
const architecture = layers.flatMap((layer, index) => {
  const forbidden = layers.slice(0, index).map((item) => `@/${item}/**`);
  return [
    {
      files: [`src/${layer}/**/*.{ts,tsx}`],
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: forbidden.length ? forbidden : [] },
        ],
      },
    },
    ...Object.entries(slices)
      .filter(([name]) => name === layer)
      .flatMap(([, names]) =>
        names.map((slice) => ({
          files: [`src/${layer}/${slice}/**/*.{ts,tsx}`],
          rules: {
            "no-restricted-imports": [
              "error",
              {
                patterns: [
                  ...forbidden.map((pattern) => ({
                    group: [pattern],
                    message:
                      "Imports must flow down the feature-sliced layers.",
                  })),
                  ...names
                    .filter((name) => name !== slice)
                    .map((name) => ({
                      group: [`@/${layer}/${name}`, `@/${layer}/${name}/**`],
                      message:
                        "Slices in the same layer must remain independent.",
                    })),
                ],
              },
            ],
          },
        })),
      ),
  ];
});
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...architecture,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
