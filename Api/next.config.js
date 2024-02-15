/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  output: 'standalone',
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}'
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}'
    }
  }
}
