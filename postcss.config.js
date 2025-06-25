module.exports = {
  plugins: [
    require('autoprefixer'),
    require('@tailwindcss/postcss'),
    ...(process.env.JEKYLL_ENV == 'production'
      ? [require('cssnano')({ preset: 'default' })]
      : [])
  ]
}