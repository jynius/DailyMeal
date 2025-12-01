import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  eslintPluginPrettierRecommended, // Prettier 통합
  {
    rules: {
      // console 직접 사용 금지 (logger 사용 강제)
      'no-console': [
        'warn',
        {
          allow: [],
        },
      ],
      // Edge Tools inline style 경고 비활성화
      'no-inline-styles': 'off',
      '@microsoft/sdl/no-inline-styles': 'off',
    },
  },
]

export default eslintConfig
