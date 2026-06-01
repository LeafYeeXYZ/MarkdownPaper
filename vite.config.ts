import { defineConfig } from 'vite-plus'

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    singleQuote: true,
    semi: false,
    sortImports: true,
    sortTailwindcss: true,
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
})
