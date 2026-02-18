const preset = require('@sanity/prettier-config')

module.exports = {
  ...preset,
  tabWidth: 4,
  plugins: [
    ...preset.plugins || [],
    'prettier-plugin-tailwindcss',
    '@ianvs/prettier-plugin-sort-imports',
  ],
}
