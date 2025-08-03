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

const userCourses = [
  {
    id: 1,
    title: "Lập trình Web Frontend",
    description: "Học HTML, CSS, JavaScript và React từ cơ bản đến nâng cao",
    image: "/placeholder.svg?height=200&width=300",
    totalLessons: 48,
    completedLessons: 12,
    progress: 25,
    status: "learning",
    lastAccessed: "2 giờ trước",
  },
  {
    id: 2,
    title: "Thiết kế UI/UX",
    description: "Thiết kế giao diện người dùng chuyên nghiệp với Figma",
    image: "/placeholder.svg?height=200&width=300",
    totalLessons: 32,
    completedLessons: 32,
    progress: 100,
    status: "completed",
    lastAccessed: "1 tuần trước",
  },
  {
    id: 3,
    title: "Marketing Digital",
    description: "Chiến lược marketing online hiệu quả cho doanh nghiệp",
    image: "/placeholder.svg?height=200&width=300",
    totalLessons: 40,
    completedLessons: 8,
    progress: 20,
    status: "learning",
    lastAccessed: "1 ngày trước",
  },
]

export default function CoursesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
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
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userInfo")
    router.push("/")
  }

  const filteredCourses = userCourses.filter((course) => {
    if (filter === "all") return true
    if (filter === "learning") return course.status === "learning"
    if (filter === "completed") return course.status === "completed"
    return true
  })

  if (!isLoggedIn) {
    return <div>Đang tải...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <Header variant="course" userInfo={userInfo} onLogout={handleLogout} showBackButton={false} />

      <div className="container mx-auto py-8 px-4">
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
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    {course.status === "completed" ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Hoàn thành
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600">
                        <Play className="h-3 w-3 mr-1" />
                        Đang học
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
                  {course.description}
                </CardDescription>

                {/* Progress */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tiến độ học tập</span>
                    <span className="font-medium">
                      {course.completedLessons}/{course.totalLessons} bài
                    </span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{course.progress}% hoàn thành</span>
                    <span>Truy cập: {course.lastAccessed}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/learn/${course.id}`} className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {course.status === "completed" ? "Ôn tập" : "Tiếp tục học"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có khóa học nào</h3>
            <p className="text-gray-600 mb-4">
              {filter === "completed"
                ? "Bạn chưa hoàn thành khóa học nào."
                : filter === "learning"
                  ? "Bạn chưa có khóa học đang học nào."
                  : "Bạn chưa được gán khóa học nào."}
            </p>
            <Link href="/">
              <Button variant="outline">Khám phá khóa học</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
