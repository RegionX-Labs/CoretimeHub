/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['github.com'],
  },
  env: {
    WS_CORETIME_CHAIN: process.env.WS_CORETIME_CHAIN,
    WS_RELAY_CHAIN: process.env.WS_RELAY_CHAIN,
    WS_CONTRACTS_CHAIN: process.env.WS_CONTRACTS_CHAIN,
    CONTRACT_XC_REGIONS: process.env.CONTRACT_XC_REGIONS,
    CONTRACT_MARKET: process.env.CONTRACT_MARKET,
  },
};

module.exports = nextConfig;
