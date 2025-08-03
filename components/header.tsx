"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft, User, LogOut, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

interface HeaderProps {
  variant?: 'default' | 'course' | 'learn'
  title?: string
  showBackButton?: boolean
  backUrl?: string
  userInfo?: any
  onLogout?: () => void
  showMobileMenu?: boolean
  onMobileMenuToggle?: () => void
}

export default function Header({
  variant = 'default',
  title,
  showBackButton = false,
  backUrl = "/",
  userInfo,
  onLogout,
  showMobileMenu = false,
  onMobileMenuToggle
}: HeaderProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn")
    setIsLoggedIn(!!loggedIn)
  }, [])

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userInfo")
      router.push("/")
    }
  }

  if (variant === 'learn') {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={onMobileMenuToggle}
            >
              {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
            <Link href={backUrl}>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{title}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">{userInfo?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs sm:text-sm">
              <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>
    )
  }

  if (variant === 'course') {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link href={backUrl}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Button>
              </Link>
            )}
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">EduPlatform</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Trang chủ
            </Link>
            <Link href="/courses" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Khóa học
            </Link>
            <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Tài khoản
            </Link>
            {isLoggedIn ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Đăng nhập
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>
    )
  }

  // Default header
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">EduPlatform</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <Link href="/courses" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Khóa học
          </Link>
          <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Tài khoản
          </Link>
          {isLoggedIn ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Đăng nhập
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
} 