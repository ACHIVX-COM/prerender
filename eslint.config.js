const js = require("@eslint/js");
const jestPlugin = require("eslint-plugin-jest");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  jestPlugin.configs['flat/recommended'],
  {
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-undef": "error",
    },
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
];
