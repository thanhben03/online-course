"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Play, CheckCircle, User, LogOut } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/header"
import { apiClient } from "@/lib/api"
import { formatPrice } from "@/lib/utils"

interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  price: number;
  instructor_id: number;
  instructor_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function CoursesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
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
      setUserInfo(JSON.parse(user))
    }

    // Fetch courses from API
    const fetchCourses = async () => {
      try {
        const result = await apiClient.getCourses()
        
        if (result.success && result.data) {
          setCourses(result.data.courses)
        } else {
          console.error('Failed to fetch courses:', result.error)
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userInfo")
    router.push("/")
  }

  const filteredCourses = courses.filter((course: Course) => {
    if (filter === "all") return true
    if (filter === "learning") return course.status === "draft"
    if (filter === "completed") return course.status === "published"
    return true
  })

  if (!isLoggedIn) {
    return <div>Đang tải...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <Header variant="course" userInfo={userInfo} onLogout={handleLogout} showBackButton={false} />

      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Khóa học của bạn</h1>
          <p className="text-gray-600">Tiếp tục hành trình học tập của bạn</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc khóa học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khóa học</SelectItem>
              <SelectItem value="learning">Đang học</SelectItem>
              <SelectItem value="completed">Đã hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={course.thumbnail_url || "/placeholder.svg"}
                    alt={course.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    {course.status === "published" ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Đã xuất bản
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600">
                        <Play className="h-3 w-3 mr-1" />
                        Bản nháp
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {course.description || "Không có mô tả"}
                </CardDescription>

                {/* Course Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảng viên</span>
                    <span className="font-medium">
                      {course.instructor_name || "Chưa có"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giá</span>
                    <span className="font-medium">
                      {formatPrice(course.price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Ngày tạo: {new Date(course.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/course/${course.id}`} className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Xem chi tiết
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải khóa học...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có khóa học nào</h3>
            <p className="text-gray-600 mb-4">
              {filter === "published"
                ? "Chưa có khóa học nào được xuất bản."
                : filter === "draft"
                  ? "Chưa có khóa học nào ở trạng thái nháp."
                  : "Chưa có khóa học nào trong hệ thống."}
            </p>
            <Link href="/">
              <Button variant="outline">Khám phá khóa học</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
