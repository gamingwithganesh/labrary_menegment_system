/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['localhost:3000', 'localhost:3001', '192.0.0.2', '192.0.0.2:3000', '192.0.0.2:3001'],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=*, microphone=(), geolocation=()' }
        ]
      }
    ];
  }
};

export default nextConfig;
