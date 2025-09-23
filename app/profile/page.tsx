"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { BookOpen, User, LogOut, ArrowLeft, Mail, Phone, School, MapPin, Tag } from "lucide-react"
import Header from "@/components/header"

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn")
    const user = localStorage.getItem("userInfo")

    if (!loggedIn) {
      router.push("/login")
      return
    }

    setIsLoggedIn(true)
    if (user) {
      const parsedUser = JSON.parse(user)
      console.log('User info in profile:', parsedUser)
      setUserInfo(parsedUser)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userInfo")
    router.push("/")
  }

  if (!isLoggedIn || !userInfo) {
    return <div>Đang tải...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <Header 
        variant="course" 
        userInfo={userInfo} 
        onLogout={handleLogout}
        showBackButton={false}
        backUrl="/courses"
      />

      <div className="container mx-auto py-8 px-4 max-w-2xl">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin tài khoản</h1>
          <p className="text-gray-600">Xem và quản lý thông tin cá nhân của bạn</p>
        </div>

        {/* Profile Information */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Thông tin cá nhân</span>
            </CardTitle>
            <CardDescription>Thông tin tài khoản của bạn được quản lý bởi hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Họ và tên</span>
                </Label>
                <Input id="name" value={userInfo.name} readOnly className="bg-gray-50 cursor-not-allowed" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>Số điện thoại</span>
                </Label>
                <Input id="phone" value={userInfo.phone || "Chưa cập nhật"} readOnly className="bg-gray-50 cursor-not-allowed" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>Email</span>
                </Label>
                <Input id="email" value={userInfo.email} readOnly className="bg-gray-50 cursor-not-allowed" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school" className="flex items-center space-x-2">
                  <School className="h-4 w-4 text-gray-500" />
                  <span>Trường học</span>
                </Label>
                <Input id="school" value={userInfo.school || "Chưa cập nhật"} readOnly className="bg-gray-50 cursor-not-allowed" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>Thành phố</span>
                </Label>
                <Input id="city" value={userInfo.city || "Chưa cập nhật"} readOnly className="bg-gray-50 cursor-not-allowed" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade" className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span>Lớp</span>
                </Label>
                <Input id="grade" value={userInfo.grade || "Chưa cập nhật"} readOnly className="bg-gray-50 cursor-not-allowed" />
              </div>
            </div>

            <div className="pt-6 border-t">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1 bg-transparent" disabled>
                  Đổi mật khẩu
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Để thay đổi thông tin cá nhân, vui lòng liên hệ với quản trị viên hệ thống
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
            <div className="text-sm text-gray-600">Khóa học đã đăng ký</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">1</div>
            <div className="text-sm text-gray-600">Khóa học hoàn thành</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-orange-600 mb-2">25%</div>
            <div className="text-sm text-gray-600">Tiến độ trung bình</div>
          </Card>
        </div>
      </div>
    </div>
  )
}
