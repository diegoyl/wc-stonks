import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: {
    localPatterns: [
      { pathname: '/flags/**' },
    ],
  },
  devIndicators: false,
}

export default nextConfig
