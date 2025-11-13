/** @type {import("prettier").Config} */
export default {
  endOfLine: 'lf',
  semi: true,
  singleQuote: true,
  useTabs: false,
  tabWidth: 2,
  trailingComma: 'es5',
  bracketSpacing: true,
  printWidth: 100,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '^fastify/(.*)$|^fastify$',
    '^@fastify/(.*)$',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/(.*)$',
    '',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
};
