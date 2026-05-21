/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Cloudflare Pages ke liye
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787",
    NEXT_PUBLIC_APP_NAME: "SiteScope",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
};

module.exports = nextConfig;
