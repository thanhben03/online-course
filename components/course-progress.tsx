"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Clock, BookOpen, Award } from "lucide-react"
import { apiClient } from "@/lib/api"

interface CourseProgressProps {
  courseId: number
  userId: number
  className?: string
}

interface ProgressData {
  enrollment: any
  progress: {
    percentage: number
    completedLessons: number
    totalLessons: number
    totalWatchedDuration: number
    totalCourseDuration: number
  }
  lessonProgress: Array<{
    id: number
    title: string
    duration: number
    order_index: number
    completed: boolean
    watched_duration: number
    last_watched_at: string | null
  }>
}

export default function CourseProgress({ courseId, userId, className }: CourseProgressProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [courseId, userId])

  const fetchProgress = async () => {
    try {
      setLoading(true)
      const result = await apiClient.getCourseProgress(courseId, userId)
      if (result.success && result.data) {
        // Handle nested data structure
        const data = result.data.data || result.data
        console.log('Progress data structure:', data)
        setProgressData(data as ProgressData)
      } else {
        // Set default empty data if no progress found
        setProgressData({
          enrollment: null,
          progress: {
            percentage: 0,
            completedLessons: 0,
            totalLessons: 0,
            totalWatchedDuration: 0,
            totalCourseDuration: 0
          },
          lessonProgress: []
        })
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
      // Set default data on error
      setProgressData({
        enrollment: null,
        progress: {
          percentage: 0,
          completedLessons: 0,
          totalLessons: 0,
          totalWatchedDuration: 0,
          totalCourseDuration: 0
        },
        lessonProgress: []
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage === 0) {
      return <Badge variant="secondary">Chưa bắt đầu</Badge>
    } else if (percentage < 100) {
      return <Badge variant="default">Đang học</Badge>
    } else {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Hoàn thành</Badge>
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!progressData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-gray-500">Không thể tải tiến trình học</p>
        </CardContent>
      </Card>
    )
  }

  // Safe access with default values
  const progress = progressData.progress || {
    percentage: 0,
    completedLessons: 0,
    totalLessons: 0,
    totalWatchedDuration: 0,
    totalCourseDuration: 0
  }
  const lessonProgress = progressData.lessonProgress || []

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tiến trình học tập</CardTitle>
          {getStatusBadge(progress.percentage)}
        </div>
        <CardDescription>
          Theo dõi quá trình học của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Tiến độ tổng thể</span>
            <span className="text-gray-600">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{progress.completedLessons}/{progress.totalLessons} bài học</span>
            <span>{formatDuration(progress.totalWatchedDuration)} / {formatDuration(progress.totalCourseDuration)}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium">{progress.completedLessons}</div>
              <div className="text-xs text-gray-500">Bài đã học</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
            <Clock className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-sm font-medium">{formatDuration(progress.totalWatchedDuration)}</div>
              <div className="text-xs text-gray-500">Thời gian học</div>
            </div>
          </div>
        </div>

        {/* Lesson Progress List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Chi tiết bài học</h4>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {lessonProgress.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50"
              >
                {lesson.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {lesson.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(lesson.duration)}
                    {lesson.watched_duration > 0 && (
                      <span className="ml-2">
                        • Đã xem: {formatTime(lesson.watched_duration)}
                      </span>
                    )}
                  </div>
                </div>
                {lesson.completed && (
                  <Award className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Completion Certificate */}
        {progress.percentage === 100 && progress.totalLessons > 0 && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <Award className="h-6 w-6 text-green-500" />
              <div>
                <div className="text-sm font-medium text-green-800">
                  Chúc mừng! Bạn đã hoàn thành khóa học
                </div>
                <div className="text-xs text-green-600">
                  Bạn đã hoàn thành tất cả {progress.totalLessons} bài học
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
