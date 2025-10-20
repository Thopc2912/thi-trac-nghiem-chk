import path from 'path'

export default defineNuxtConfig({
  css: [path.resolve(__dirname, 'assets/css/tailwind.css')],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
