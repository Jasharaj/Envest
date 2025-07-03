/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
  // Add environment variables if needed
  env: {
    NEXT_PUBLIC_COHERE_API_KEY: process.env.NEXT_PUBLIC_COHERE_API_KEY,
  },
}

module.exports = nextConfig
