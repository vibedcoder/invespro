import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@gorules/zen-engine"],
};

const withMDX = createMDX();

export default withMDX(nextConfig);
