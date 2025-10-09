/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle pdf-parse and its dependencies for server-side only
      config.externals = config.externals || []
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse',
        'canvas': 'commonjs canvas',
        '@mapbox/node-pre-gyp': 'commonjs @mapbox/node-pre-gyp'
      })

      // Disable pdf.worker.js for server-side rendering
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdf-parse/package.json': false,
        'pdfjs-dist/build/pdf.worker.js': false
      }
    }

    return config
  }
}

module.exports = nextConfig