import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['diego-mac.local'],
  typescript: { ignoreBuildErrors: true },
  images: {
    localPatterns: [
      { pathname: '/flags/**' },
    ],
  },
  devIndicators: false,
}

export default nextConfig
