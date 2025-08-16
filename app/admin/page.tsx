"use client"

import { useState } from "react"
import { 
  LayoutDashboard, 
  BookOpen, 
  Upload, 
  Users, 
  Database,
  Menu,
  X,
  Settings,
  ChevronRight,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"

// Dynamic imports các components
import dynamic from 'next/dynamic'

const LoadingSpinner = () => (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const CourseManagement = dynamic(() => import('./components/CourseManagement'), { 
  ssr: false,
  loading: LoadingSpinner
})
const VideoUpload = dynamic(() => import('./components/VideoUpload'), { 
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upload video/tài liệu
          </h2>
          <p className="text-gray-600">
            Đang tải giao diện...
          </p>
        </div>
      </div>
      <LoadingSpinner />
    </div>
  )
})
const LessonManagement = dynamic(() => import('./components/LessonManagement'), { 
  ssr: false,
  loading: LoadingSpinner
})
const UserManagement = dynamic(() => import('./components/UserManagement'), { 
  ssr: false,
  loading: LoadingSpinner
})
const SecurityAlerts = dynamic(() => import('./components/SecurityAlerts'), { 
  ssr: false,
  loading: LoadingSpinner
})

type ActiveModule = 'dashboard' | 'courses' | 'upload' | 'lessons' | 'users' | 'security'

export default function AdminPage() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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

  const modules = [
    {
      id: 'dashboard' as ActiveModule,
      title: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Tổng quan hệ thống'
    },
    {
      id: 'courses' as ActiveModule,
      title: 'Quản lý khóa học',
      icon: BookOpen,
      description: 'Tạo, sửa, xóa khóa học'
    },
    {
      id: 'upload' as ActiveModule,
      title: 'Upload video/tài liệu',
      icon: Upload,
      description: 'Tải lên video và tài liệu'
    },
    {
      id: 'lessons' as ActiveModule,
      title: 'Tạo chuyên mục/bài học',
      icon: Settings,
      description: 'Quản lý bài học và chuyên mục'
    },
    {
      id: 'users' as ActiveModule,
      title: 'Quản lý tài khoản',
      icon: Users,
      description: 'Thêm/xóa/sửa tài khoản học viên'
    },
    {
      id: 'security' as ActiveModule,
      title: 'Cảnh báo bảo mật',
      icon: Shield,
      description: 'Theo dõi hoạt động đăng nhập bất thường'
    }
  ]

  const renderContent = () => {
    switch (activeModule) {
      case 'courses':
        return <CourseManagement />
      case 'upload':
        return <VideoUpload />
      case 'lessons':
        return <LessonManagement />
      case 'users':
        return <UserManagement />
      case 'security':
        return <SecurityAlerts />
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
              {/* <p className="text-gray-600">Quản lý database và dữ liệu mẫu</p> */}
            </div>

            {/* Alert Messages */}
            {message && (
              <Alert className={`${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Actions */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div> */}

            {/* Module Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Các module quản lý</CardTitle>
                <CardDescription>
                  Chọn module bên trái để bắt đầu quản lý
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modules.slice(1).map((module) => {
                    const Icon = module.icon
                    return (
                      <div 
                        key={module.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setActiveModule(module.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-semibold text-gray-900">{module.title}</h4>
                              <p className="text-sm text-gray-600">{module.description}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {modules.map((module) => {
              const Icon = module.icon
              const isActive = activeModule === module.id
              
              return (
                <button
                  key={module.id}
                  onClick={() => {
                    setActiveModule(module.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <div>
                    <div className="font-medium">{module.title}</div>
                    <div className="text-xs text-gray-500">{module.description}</div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {renderContent()}
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
} 