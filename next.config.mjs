/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // sql.js 是 WASM 模块，webpack 打包会出错，必须作为外部依赖
      config.externals = [...config.externals, "sql.js"];
    }
    return config;
  },
};

export default nextConfig;
