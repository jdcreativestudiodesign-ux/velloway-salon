import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Only the site's own photo folder can be resized, with no query strings.
    localPatterns: [{ pathname: "/images/**", search: "" }],
  },
};

export default nextConfig;
