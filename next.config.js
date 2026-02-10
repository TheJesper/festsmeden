/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/app.html',
      },
    ]
  },
}

module.exports = nextConfig
