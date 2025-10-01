/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Enable client-side processing with Node.js modules excluded
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle Node.js modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        buffer: false,
        crypto: false,
        stream: false,
        util: false,
        path: false,
        os: false,
        zlib: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;