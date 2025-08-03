"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate login API call
    setTimeout(() => {
      if (formData.email === "student@edu.vn" && formData.password === "123456") {
        // Successful login
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            name: "Nguyễn Văn A",
            email: "student@edu.vn",
            phone: "0123456789",
            school: "Đại học Công nghệ",
            city: "Hồ Chí Minh",
            category: "Sinh viên",
          }),
        )
        router.push("/courses")
      } else {
        setError("Thông tin đăng nhập không chính xác. Vui lòng thử lại.")
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <BookOpen className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">EduPlatform</span>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Đăng nhập</CardTitle>
            <CardDescription className="text-gray-600">Nhập thông tin tài khoản để truy cập khóa học</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email hoặc Số điện thoại</Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="Nhập email hoặc số điện thoại"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.remember}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, remember: checked as boolean }))}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Ghi nhớ đăng nhập
                </Label>
              </div>

              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Demo: Email: <code className="bg-gray-100 px-1 rounded">student@edu.vn</code> | Mật khẩu:{" "}
                <code className="bg-gray-100 px-1 rounded">123456</code>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                ← Quay về trang chủ
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
