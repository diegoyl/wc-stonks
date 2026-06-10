import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: '/flags/**' },
    ],
  },
  devIndicators: false,
}

export default nextConfig
