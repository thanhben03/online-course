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
    // Tối ưu memory cho large file handling
    proxyTimeout: 300000, // 5 phút
    largePageDataBytes: 512 * 1024, // 512KB
  },
  // Tối ưu cho VPS resource hạn chế
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Tắt X-Powered-By header
  
  // Headers tối ưu cho upload
  async headers() {
    return [
      {
        source: '/api/upload-proxy',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ]
  },
}

export default nextConfig
