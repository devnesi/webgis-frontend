/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['ol', 'rlayers'],
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig
