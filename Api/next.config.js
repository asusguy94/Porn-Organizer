/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  output: 'standalone',
  headers: () => [
    {
      source: '/api/:path*',
      headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }]
    }
  ]
}
