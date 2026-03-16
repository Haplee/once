/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // PWA solo en producción
  register: true,
  skipWaiting: true,
})

const nextConfig = {
  reactStrictMode: true,
  // Solo añadir standalone si se construye para Docker
  ...(process.env.BUILD_TARGET === 'docker' && { output: 'standalone' }),
  images: {
    remotePatterns: [],
  },
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
        ],
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
