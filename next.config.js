/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['github.com'],
  },
  env: {
    WS_ROCOCO_CORETIME_CHAIN: process.env.WS_ROCOCO_CORETIME_CHAIN || '',
    WS_KUSAMA_CORETIME_CHAIN: process.env.WS_KUSAMA_CORETIME_CHAIN || '',
    SUBSCAN_CORETIME_ROCOCO: process.env.SUBSCAN_CORETIME_ROCOCO || '',
    SUBSCAN_CORETIME_KUSAMA: process.env.SUBSCAN_CORETIME_KUSAMA || '',
    WS_REGIONX_CHAIN: process.env.WS_REGIONX_CHAIN || '',
    WS_ROCOCO_RELAY_CHAIN: process.env.WS_ROCOCO_RELAY_CHAIN,
    WS_KUSAMA_RELAY_CHAIN: process.env.WS_KUSAMA_RELAY_CHAIN,
    KUSAMA_CORETIME_API: process.env.KUSAMA_CORETIME_API,
    ROCOCO_CORETIME_API: process.env.ROCOCO_CORETIME_API,
    EXPERIMENTAL: process.env.EXPERIMENTAL,
  },
};

module.exports = nextConfig;
