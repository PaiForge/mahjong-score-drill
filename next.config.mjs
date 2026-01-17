import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'dist',
  output: 'export',
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': path.resolve(__dirname, './src/lib/shims/react-native.ts'),
    }
    return config
  },
  turbopack: {
    resolveAlias: {
      'react-native': './src/lib/shims/react-native.ts',
    },
  },
}

export default nextConfig
