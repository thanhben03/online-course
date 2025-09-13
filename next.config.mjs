/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable static optimization for all pages
  trailingSlash: false,
  // Cấu hình cho upload file lớn - KHÔNG GIỚI HẠN
  api: {
    bodyParser: {
      sizeLimit: false, // Bỏ hoàn toàn giới hạn dung lượng
    },
    responseLimit: false, // Bỏ giới hạn response
  },
  // Cấu hình experimental cho file lớn
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-s3'],
    // Tăng giới hạn cho App Router
    appDir: true,
  },
}

export default nextConfig
