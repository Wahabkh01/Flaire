import path from "path";
const webpack = require("webpack");
import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";

const nextConfig: NextConfig = {
  webpack: (
    config: WebpackConfig,
    { isServer }: { dev: boolean; isServer: boolean }
  ) => {
    if (isServer) {
      config.plugins!.push(
        new webpack.DefinePlugin({
          self: "{}" // ✅ Define a fake self in Node.js
        })
      );
    }

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@": path.resolve(__dirname, "src"),
      },
    };

    return config;
  },
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
