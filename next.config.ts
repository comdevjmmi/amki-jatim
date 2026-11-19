import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Candidate photos are shrunk in the browser first, but the default 1 MB
    // server-action body limit is too tight for the occasional larger JPEG.
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
