/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'ene.fpt.ac.ma',
      },
      {
        protocol: 'https',
        hostname: 'www.drisskettani.com',
      },
    ],
  },
};

export default nextConfig;
