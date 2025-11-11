import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    // files: ["**/*.{js,mjs,cjs}"],
    // plugins: ["js"],
    // extends: ["js/recommended"],
    files: ["**/*.{js,mjs,cjs}"],
    plugins: ["js"],
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      "no-unused-vars": ["warn", { args: "none", vars: "all" }],
      "no-undef": "warn",
      semi: ["warn", "always"],
    },
  },
  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
    extends: ["json/recommended"],
  },
]);
