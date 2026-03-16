const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SPACETIMEDB_URI: process.env.NEXT_PUBLIC_SPACETIMEDB_URI,
    NEXT_PUBLIC_SPACETIMEDB_DB_NAME: process.env.NEXT_PUBLIC_SPACETIMEDB_DB_NAME,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  },
};

module.exports = withPWA(nextConfig);
