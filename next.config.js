/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['ol', 'rlayers'],
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig
