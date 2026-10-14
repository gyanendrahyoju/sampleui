// Proxy /api/* to the Spring Boot service so the browser avoids CORS.
const API_URL = process.env.API_URL || "http://localhost:10000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;
