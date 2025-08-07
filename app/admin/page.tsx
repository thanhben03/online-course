"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, Users, BookOpen, Play, CheckCircle } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [stats, setStats] = useState<{
    users: number
    courses: number
    lessons: number
  } | null>(null)

  const handleInitializeDB = async () => {
    setLoading(true)
    setMessage(null)
    
    try {
      const result = await apiClient.initializeDatabase()
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Database đã được khởi tạo thành công!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Lỗi khi khởi tạo database' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi khởi tạo database' })
    } finally {
      setLoading(false)
    }
  }

  const handleSeedData = async () => {
    setLoading(true)
    setMessage(null)
    
    try {
      const result = await apiClient.seedData()
      
      if (result.success && result.data) {
        setMessage({ 
          type: 'success', 
          text: `Đã tạo thành công ${result.data.coursesCreated} khóa học và ${result.data.lessonsCreated} bài học!` 
        })
      } else {
        setMessage({ type: 'error', text: result.error || 'Lỗi khi tạo dữ liệu mẫu' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi tạo dữ liệu mẫu' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Quản lý database và dữ liệu mẫu</p>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Database Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Khởi tạo Database
              </CardTitle>
              <CardDescription>
                Tạo các bảng cần thiết trong database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleInitializeDB} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Đang khởi tạo..." : "Khởi tạo Database"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Tạo Dữ liệu Mẫu
              </CardTitle>
              <CardDescription>
                Tạo khóa học và bài học mẫu để test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSeedData} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? "Đang tạo..." : "Tạo Dữ liệu Mẫu"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sample Data Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dữ liệu mẫu sẽ được tạo</CardTitle>
            <CardDescription>
              Danh sách các khóa học và bài học sẽ được tạo tự động
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Lập trình Web Frontend</h4>
                  <p className="text-sm text-gray-600 mb-2">4 bài học</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>Giới thiệu về HTML</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>CSS cơ bản</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>JavaScript Fundamentals</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>React Basics</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Thiết kế UI/UX</h4>
                  <p className="text-sm text-gray-600 mb-2">3 bài học</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>Nguyên lý thiết kế</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>Wireframing với Figma</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>Design Systems</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Marketing Digital</h4>
                  <p className="text-sm text-gray-600 mb-2">3 bài học</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>Tổng quan về Digital Marketing</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>SEO cơ bản</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>Google Ads</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Lập trình Backend với Node.js</h4>
                  <p className="text-sm text-gray-600 mb-2">4 bài học</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>Giới thiệu Node.js</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>Express.js Framework</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>Database với MongoDB</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="h-3 w-3 text-blue-500" />
                      <span>Authentication & Authorization</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn sử dụng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <span>Đầu tiên, khởi tạo database để tạo các bảng cần thiết</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <span>Sau đó, tạo dữ liệu mẫu để có courses và lessons để test</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <span>Truy cập trang courses để xem danh sách khóa học</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <span>Đăng ký/đăng nhập để test authentication</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 