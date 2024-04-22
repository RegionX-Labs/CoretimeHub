/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['github.com'],
  },
  env: {
    WS_CORETIME_CHAIN: process.env.WS_CORETIME_CHAIN || '',
    WS_RELAY_CHAIN: process.env.WS_RELAY_CHAIN,
  },
};

module.exports = nextConfig;
