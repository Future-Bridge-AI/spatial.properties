/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for deployment to any static host
  output: 'export',

  // Disable image optimisation for static export
  // (use native <img> or external CDN for images)
  images: {
    unoptimized: true,
  },

  // Trailing slashes for cleaner URLs on static hosts
  trailingSlash: true,
}

module.exports = nextConfig
