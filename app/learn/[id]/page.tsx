"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Header from "@/components/header"
import VideoPlayer from "@/components/video-player"
import { apiClient } from "@/lib/api"
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  Maximize,
  Settings,
  CheckCircle,
  Circle,
  Download,
  FileText,
  ArrowLeft,
  User,
  LogOut,
  Menu,
  X,
  List,
  Loader2,
} from "lucide-react"

interface Lesson {
  id: number
  course_id: number
  title: string
  description?: string
  video_url?: string
  duration: number
  order_index: number
  created_at: string
  updated_at: string
}

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

interface Document {
  id: number
  filename: string
  originalName: string
  fileSize: number
  fileType: string
  downloadUrl: string
  uploadedAt: string
  icon: string
}

interface Video {
  source: 'direct' | 'upload'
  url: string
  type: 'url' | 'file'
  filename?: string
  fileType?: string
  fileSize?: number
}

export default function LearnPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number.parseInt(params.id as string)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'documents'>('content')
  const [documents, setDocuments] = useState<Document[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [videoLoading, setVideoLoading] = useState(false)

  // Fetch documents for a lesson
  const fetchDocuments = async (lessonId: number) => {
    setDocumentsLoading(true)
    try {
      const response = await fetch(`/api/lessons/${lessonId}/documents`)
      const data = await response.json()
      
      if (data.success) {
        setDocuments(data.documents || [])
      } else {
        console.error('Error fetching documents:', data.error)
        setDocuments([])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    } finally {
      setDocumentsLoading(false)
    }
  }

  // Fetch video for a lesson
  const fetchVideo = async (lessonId: number) => {
    setVideoLoading(true)
    try {
      const response = await fetch(`/api/lessons/${lessonId}/videos`)
      const data = await response.json()
      
      if (data.success) {
        setCurrentVideo(data.video)
      } else {
        console.error('Error fetching video:', data.error)
        setCurrentVideo(null)
      }
    } catch (error) {
      console.error('Error fetching video:', error)
      setCurrentVideo(null)
    } finally {
      setVideoLoading(false)
    }
  }

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

    // Fetch course and lessons data
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
          
          // Set first lesson as current
          if (sortedLessons.length > 0) {
            setCurrentLesson(sortedLessons[0])
            setDuration(sortedLessons[0].duration)
            // Fetch documents and video for first lesson
            fetchDocuments(sortedLessons[0].id)
            fetchVideo(sortedLessons[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, courseId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => Math.min(prev + 1, duration))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  const handleLogout = () => {
    router.push("/")
  }

  // Group lessons by order_index ranges (simulating chapters)
  const getChapters = () => {
    if (lessons.length === 0) return []
    
    const chapters = []
    let currentChapter = {
      id: 1,
      title: "Chương 1",
      lessons: [] as Lesson[]
    }
    
    lessons.forEach((lesson, index) => {
      // Create new chapter every 3-4 lessons
      if (index > 0 && index % 3 === 0) {
        chapters.push(currentChapter)
        currentChapter = {
          id: chapters.length + 1,
          title: `Chương ${chapters.length + 1}`,
          lessons: []
        }
      }
      currentChapter.lessons.push(lesson)
    })
    
    if (currentChapter.lessons.length > 0) {
      chapters.push(currentChapter)
    }
    
    return chapters
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIconComponent = (iconType: string) => {
    switch (iconType) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'excel':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'ppt':
        return <FileText className="h-5 w-5 text-orange-500" />
      case 'image':
        return <FileText className="h-5 w-5 text-purple-500" />
      case 'text':
        return <FileText className="h-5 w-5 text-gray-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson)
    setDuration(lesson.duration)
    setCurrentTime(0)
    setIsPlaying(false)
    
    // Fetch documents and video for this lesson
    fetchDocuments(lesson.id)
    fetchVideo(lesson.id)
  }

  if (!isLoggedIn) {
    return <div>Đang tải...</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Đang tải khóa học...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Không tìm thấy khóa học</p>
          <Button onClick={() => router.push('/courses')} className="mt-4">
            Quay về danh sách khóa học
          </Button>
        </div>
      </div>
    )
  }

  const chapters = getChapters()
  const completedLessons = 0 // TODO: Implement progress tracking
  const totalLessons = lessons.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        variant="learn"
        showBackButton={false}
        title={course.title}
        userInfo={userInfo}
        onLogout={handleLogout}
        showMobileMenu={showSidebar}
        onMobileMenuToggle={() => setShowSidebar(!showSidebar)}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Course Content */}
        <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900 mb-2">Nội dung khóa học</h2>
            <Progress value={totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">{completedLessons}/{totalLessons} bài đã hoàn thành</p>
          </div>

          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-4 space-y-2">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="border rounded-lg">
                  <div className="p-3 border-b bg-gray-50">
                    <span className="font-medium text-sm">{chapter.title}</span>
                  </div>
                  <div>
                    {chapter.lessons.map((lesson) => (
                      <Button
                        key={lesson.id}
                        variant={currentLesson?.id === lesson.id ? "secondary" : "ghost"}
                        className="w-full justify-start p-3 h-auto border-b last:border-b-0"
                        onClick={() => {
                          handleLessonSelect(lesson)
                          setShowSidebar(false) // Close sidebar on mobile after selecting lesson
                        }}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{lesson.title}</div>
                            <div className="text-xs text-gray-500">{formatTime(lesson.duration)}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Overlay for mobile */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main Content - Video Player */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black relative">
            {/* Video Player */}
            <div className="w-full h-full flex items-center justify-center">
              {videoLoading ? (
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                  <p className="text-sm">Đang tải video...</p>
                </div>
              ) : currentVideo ? (
                <VideoPlayer
                  src={currentVideo.url}
                  className="w-full h-full"
                  autoPlay={false}
                />
              ) : (
                <div className="text-center text-white">
                  <FileText className="h-16 w-16 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">Chưa có video cho bài học này</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Video có thể được thêm vào trường video_url hoặc upload file video
                  </p>
                </div>
              )}
            </div>

            {/* Video Controls */}
            {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4">
              <div className="space-y-2">
                <Progress value={(currentTime / duration) * 100} className="h-1 bg-white/20" />
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-1 sm:p-2"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </Button>
                    <span className="text-xs sm:text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-1 sm:p-2">
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-1 sm:p-2">
                      <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-1 sm:p-2">
                      <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Mobile tabs for content and documents */}
          <div className="md:hidden border-t bg-white">
            <div className="flex">
              <Button
                variant={activeTab === 'content' ? 'default' : 'ghost'}
                className="flex-1 rounded-none"
                onClick={() => setActiveTab('content')}
              >
                <List className="h-4 w-4 mr-2" />
                Nội dung
              </Button>
              <Button
                variant={activeTab === 'documents' ? 'default' : 'ghost'}
                className="flex-1 rounded-none"
                onClick={() => setActiveTab('documents')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Tài liệu
              </Button>
            </div>
          </div>

          {/* Mobile content area */}
          <div className="md:hidden h-64 border-t bg-white">
            {activeTab === 'content' ? (
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="border rounded-lg">
                      <div className="p-3 border-b bg-gray-50">
                        <span className="font-medium text-sm">{chapter.title}</span>
                      </div>
                      <div>
                        {chapter.lessons.map((lesson) => (
                          <Button
                            key={lesson.id}
                            variant={currentLesson?.id === lesson.id ? "secondary" : "ghost"}
                            className="w-full justify-start p-3 h-auto border-b last:border-b-0"
                            onClick={() => handleLessonSelect(lesson)}
                          >
                            <div className="flex items-center space-x-3 w-full">
                              <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <div className="flex-1 text-left">
                                <div className="font-medium text-sm">{lesson.title}</div>
                                <div className="text-xs text-gray-500">{formatTime(lesson.duration)}</div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-4">
                  {documentsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-500" />
                      <p className="text-gray-500 text-sm">Đang tải tài liệu...</p>
                    </div>
                  ) : documents.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Tài liệu bài học</h4>
                      {documents.map((doc) => (
                        <div key={doc.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            {getFileIconComponent(doc.icon)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {doc.filename}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.downloadUrl, '_blank')}
                              className="flex-shrink-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Chưa có tài liệu nào cho bài học này</p>
                      <p className="text-gray-400 text-xs mt-1">Tài liệu bao gồm: PDF, Word, Excel, PowerPoint, hình ảnh</p>
                    </div>
                  )}

                  <Separator className="my-6" />


                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Mô tả bài học</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {currentLesson?.description || "Chưa có mô tả cho bài học này."}
                    </p>
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Right Sidebar - Documents (Desktop only) */}
        <div className="hidden md:block w-80 border-l bg-white">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Tài liệu bài học</h3>
            <p className="text-xs text-gray-500 mt-1">PDF, Word, Excel, PowerPoint và hình ảnh</p>
          </div>

          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-4">
              {documentsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-500" />
                  <p className="text-gray-500 text-sm">Đang tải tài liệu...</p>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        {getFileIconComponent(doc.icon)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.filename}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(doc.fileSize)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(doc.downloadUrl, '_blank')}
                          className="flex-shrink-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Chưa có tài liệu nào cho bài học này</p>
                  <p className="text-gray-400 text-xs mt-1">Tài liệu bao gồm: PDF, Word, Excel, PowerPoint, hình ảnh</p>
                </div>
              )}

              <Separator className="my-6" />

          

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Mô tả bài học</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {currentLesson?.description || "Chưa có mô tả cho bài học này."}
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
