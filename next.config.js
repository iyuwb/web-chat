/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")]
  }
};

export default nextConfig;
