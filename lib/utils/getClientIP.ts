import { NextRequest } from 'next/server';

/**
 * Lấy IP address của client từ request
 * Xử lý các trường hợp khác nhau: direct connection, proxy, CDN
 */
export function getClientIP(request: NextRequest): string {
  // Thử các header khác nhau để lấy IP thật
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  const clientIP = request.headers.get('x-client-ip');
  const forwarded = request.headers.get('forwarded');

  // X-Forwarded-For có thể chứa nhiều IP, lấy IP đầu tiên
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  // Cloudflare connecting IP
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // X-Real-IP
  if (realIP) {
    return realIP;
  }

  // X-Client-IP
  if (clientIP) {
    return clientIP;
  }

  // Forwarded header (RFC 7239)
  if (forwarded) {
    const forMatch = forwarded.match(/for=([^;,\s]+)/);
    if (forMatch) {
      // Loại bỏ quotes và port nếu có
      return forMatch[1].replace(/["[\]]/g, '').split(':')[0];
    }
  }

  // Fallback to direct connection IP (có thể là proxy IP)
  const directIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('remote-addr') ||
                   '127.0.0.1';

  return directIP;
}

/**
 * Lấy User Agent từ request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'Unknown';
}

/**
 * Kiểm tra xem IP có phải là private/local IP không
 */
export function isPrivateIP(ip: string): boolean {
  const privateRanges = [
    /^127\./, // Loopback
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^::1$/, // IPv6 loopback
    /^fc00:/, // IPv6 private
    /^fe80:/, // IPv6 link-local
  ];

  return privateRanges.some(range => range.test(ip));
}

/**
 * Làm sạch và chuẩn hóa IP address
 */
export function normalizeIP(ip: string): string {
  // Loại bỏ whitespace
  ip = ip.trim();
  
  // Loại bỏ port nếu có
  if (ip.includes(':') && !ip.includes('::')) {
    // IPv4 với port
    const lastColonIndex = ip.lastIndexOf(':');
    const possiblePort = ip.substring(lastColonIndex + 1);
    if (/^\d+$/.test(possiblePort)) {
      ip = ip.substring(0, lastColonIndex);
    }
  }
  
  // Loại bỏ brackets cho IPv6
  ip = ip.replace(/^\[|\]$/g, '');
  
  return ip;
}
