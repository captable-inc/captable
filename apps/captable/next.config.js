/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // For client-side builds, externalize Node.js built-ins
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        perf_hooks: false,
      };
    }

    // External database drivers for both client and server builds
    config.externals.push({
      postgres: "commonjs postgres",
      pg: "commonjs pg",
      mysql2: "commonjs mysql2",
      sqlite3: "commonjs sqlite3",
      "better-sqlite3": "commonjs better-sqlite3",
      "@captable/email": "module @captable/email",
    });

    return config;
  },
};

export default nextConfig;
