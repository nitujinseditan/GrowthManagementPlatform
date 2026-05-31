/** @type {import('next').NextConfig} */
const nextConfig = {
  // diff 库是 CommonJS，需要外部化处理
  serverExternalPackages: ["diff"],
};

export default nextConfig;
