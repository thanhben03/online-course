"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Header from "@/components/header"
import CourseProgress from "@/components/course-progress"
import { apiClient } from "@/lib/api"
import {
  BookOpen,
  Clock,
  Users,
  Play,
  Star,
  User,
  ArrowLeft,
  Loader2,
  GraduationCap
} from "lucide-react"

interface Course {
  id: number
  title: string
  description?: string
  thumbnail_url?: string
  price: number
  instructor_id: number
  instructor_name?: string
  status: string
  created_at: string
  updated_at: string
}

interface Lesson {
  id: number
  title: string
  duration: number
  order_index: number
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number.parseInt(params.id as string)
  const [redirected, setRedirected] = useState(false)
  // Redirect directly to learn page for this course
  useEffect(() => {
    if (!Number.isNaN(courseId)) {
      router.replace(`/learn/${courseId}`)
      setRedirected(true)
    }
  }, [router, courseId])

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)

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

    fetchData()
  }, [router, courseId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch course details
      const courseResult = await apiClient.getCourse(courseId)
      if (courseResult.success && courseResult.data) {
        setCourse(courseResult.data.course)
      }

      // Fetch lessons
      const lessonsResult = await apiClient.getLessonsByCourse(courseId)
      if (lessonsResult.success && lessonsResult.data) {
        const sortedLessons = lessonsResult.data.lessons.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
        setLessons(sortedLessons)
      }

      // Check enrollment status
      const user = localStorage.getItem("userInfo")
      if (user) {
        const userObj = JSON.parse(user)
        const progressResult = await apiClient.getCourseProgress(courseId, userObj.id)
        if (progressResult.success && progressResult.data?.data?.enrollment) {
          setIsEnrolled(true)
        }
      }
    } catch (error) {
      console.error('Error fetching data 123:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!userInfo) return

    try {
      setEnrolling(true)
      const result = await apiClient.enrollInCourse(courseId, userInfo.id)
      if (result.success) {
        setIsEnrolled(true)
        // Redirect to learn page
        router.push(`/learn/${courseId}`)
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
    } finally {
      setEnrolling(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userInfo")
    router.push("/")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTotalDuration = () => {
    return lessons.reduce((total, lesson) => total + lesson.duration, 0)
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // If redirecting, show minimal feedback while navigation happens
  if (redirected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang chuyển hướng tới trang học...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <div>Đang tải...</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          variant="default"
          userInfo={userInfo}
          onLogout={handleLogout}
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Đang tải thông tin khóa học...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          variant="default"
          userInfo={userInfo}
          onLogout={handleLogout}
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p>Không tìm thấy khóa học</p>
            <Button onClick={() => router.push('/courses')} className="mt-4">
              Quay về danh sách khóa học
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        variant="default"
        userInfo={userInfo}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/courses')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách khóa học
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                    <CardDescription className="text-base">
                      {course.description || "Chưa có mô tả cho khóa học này"}
                    </CardDescription>
                  </div>
                  <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                    {course.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                  </Badge>
                </div>
              </CardHeader>
              {course.thumbnail_url && (
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin khóa học</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">{lessons.length}</div>
                      <div className="text-xs text-gray-500">Bài học</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="text-sm font-medium">{formatDuration(getTotalDuration())}</div>
                      <div className="text-xs text-gray-500">Tổng thời lượng</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="text-sm font-medium">{course.instructor_name || 'Giảng viên'}</div>
                      <div className="text-xs text-gray-500">Giảng viên</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="text-sm font-medium">{course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}</div>
                      <div className="text-xs text-gray-500">Học phí</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lesson List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Danh sách bài học</CardTitle>
                <CardDescription>
                  {lessons.length} bài học • {formatDuration(getTotalDuration())} tổng thời lượng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{lesson.title}</div>
                        <div className="text-xs text-gray-500 flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(lesson.duration)}</span>
                        </div>
                      </div>
                      <Play className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Tham gia khóa học</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEnrolled ? (
                  <>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-green-800 font-medium">Bạn đã đăng ký khóa học này</div>
                      <div className="text-green-600 text-sm mt-1">Tiếp tục học để hoàn thành khóa học</div>
                    </div>
                    <Button 
                      onClick={() => router.push(`/learn/${courseId}`)}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Tiếp tục học
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()}đ`}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Một lần thanh toán</div>
                    </div>
                    <Button 
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full"
                    >
                      {enrolling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {course.price === 0 ? 'Đăng ký miễn phí' : 'Đăng ký khóa học'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Progress Card */}
            {isEnrolled && userInfo && (
              <CourseProgress 
                courseId={courseId} 
                userId={userInfo.id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
