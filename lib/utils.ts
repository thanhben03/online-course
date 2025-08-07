import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string | null | undefined): string {
  // Chuyển đổi string thành number nếu cần
  let numericPrice: number
  if (typeof price === 'string') {
    numericPrice = parseFloat(price)
  } else {
    numericPrice = price || 0
  }
  
  if (!numericPrice || numericPrice === 0) {
    return "Miễn phí"
  }
  
  return numericPrice.toLocaleString('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  })
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) {
    return "0 phút"
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes} phút`
  }

  if (remainingMinutes === 0) {
    return `${hours} giờ`
  }

  return `${hours} giờ ${remainingMinutes} phút`
}
