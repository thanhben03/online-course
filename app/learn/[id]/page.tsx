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
} from "lucide-react"

const courseData = {
  1: {
    title: "Lập trình Web Frontend",
    description: "Học HTML, CSS, JavaScript và React từ cơ bản đến nâng cao",
    chapters: [
      {
        id: 1,
        title: "Giới thiệu về Web Development",
        lessons: [
          {
            id: 1,
            title: "Tổng quan về Web Development",
            duration: "15:30",
            completed: true,
            documents: ["Slide bài gi강.pdf", "Tài liệu tham khảo.docx"],
          },
          {
            id: 2,
            title: "Cài đặt môi trường phát triển",
            duration: "12:45",
            completed: true,
            documents: ["Hướng dẫn cài đặt.pdf"],
          },
          { id: 3, title: "Cấu trúc thư mục dự án", duration: "10:20", completed: false, documents: [] },
        ],
      },
      {
        id: 2,
        title: "HTML Cơ bản",
        lessons: [
          {
            id: 4,
            title: "Cú pháp HTML cơ bản",
            duration: "18:15",
            completed: false,
            documents: ["HTML Cheatsheet.pdf"],
          },
          {
            id: 5,
            title: "Các thẻ HTML thông dụng",
            duration: "22:30",
            completed: false,
            documents: ["Danh sách thẻ HTML.pdf", "Bài tập thực hành.docx"],
          },
          { id: 6, title: "Form và Input trong HTML", duration: "16:45", completed: false, documents: [] },
        ],
      },
      {
        id: 3,
        title: "CSS Styling",
        lessons: [
          {
            id: 7,
            title: "CSS Selectors và Properties",
            duration: "20:10",
            completed: false,
            documents: ["CSS Reference.pdf"],
          },
          {
            id: 8,
            title: "Flexbox Layout",
            duration: "25:30",
            completed: false,
            documents: ["Flexbox Guide.pdf", "Flexbox Examples.html"],
          },
          { id: 9, title: "CSS Grid System", duration: "28:45", completed: false, documents: [] },
        ],
      },
    ],
  },
}

export default function LearnPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = Number.parseInt(params.id as string)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [expandedChapters, setExpandedChapters] = useState<number[]>([1])
  const [currentLesson, setCurrentLesson] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(930) // 15:30 in seconds
  const [showSidebar, setShowSidebar] = useState(false)
  const [showDocuments, setShowDocuments] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'documents'>('content')

  const course = courseData[courseId as keyof typeof courseData]

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

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId],
    )
  }

  const getCurrentLesson = () => {
    for (const chapter of course?.chapters || []) {
      const lesson = chapter.lessons.find((l) => l.id === currentLesson)
      if (lesson) return lesson
    }
    return null
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!isLoggedIn || !course) {
    return <div>Đang tải...</div>
  }

  const currentLessonData = getCurrentLesson()

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
            <Progress value={25} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">2/9 bài đã hoàn thành</p>
          </div>

          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-4 space-y-2">
              {course.chapters.map((chapter) => (
                <div key={chapter.id} className="border rounded-lg">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <span className="font-medium text-left">{chapter.title}</span>
                    {expandedChapters.includes(chapter.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  {expandedChapters.includes(chapter.id) && (
                    <div className="border-t">
                      {chapter.lessons.map((lesson) => (
                        <Button
                          key={lesson.id}
                          variant={currentLesson === lesson.id ? "secondary" : "ghost"}
                          className="w-full justify-start p-3 h-auto border-b last:border-b-0"
                          onClick={() => {
                            setCurrentLesson(lesson.id)
                            setShowSidebar(false) // Close sidebar on mobile after selecting lesson
                          }}
                        >
                          <div className="flex items-center space-x-3 w-full">
                            {lesson.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            )}
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">{lesson.title}</div>
                              <div className="text-xs text-gray-500">{lesson.duration}</div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
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
              <div className="text-white text-center px-4">
                <Play className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                <p className="text-base sm:text-lg opacity-75">{currentLessonData?.title}</p>
                <p className="text-xs sm:text-sm opacity-50">Thời lượng: {currentLessonData?.duration}</p>
              </div>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4">
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
            </div>
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
                  {course.chapters.map((chapter) => (
                    <div key={chapter.id} className="border rounded-lg">
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-3 h-auto"
                        onClick={() => toggleChapter(chapter.id)}
                      >
                        <span className="font-medium text-left text-sm">{chapter.title}</span>
                        {expandedChapters.includes(chapter.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>

                      {expandedChapters.includes(chapter.id) && (
                        <div className="border-t">
                          {chapter.lessons.map((lesson) => (
                            <Button
                              key={lesson.id}
                              variant={currentLesson === lesson.id ? "secondary" : "ghost"}
                              className="w-full justify-start p-3 h-auto border-b last:border-b-0"
                              onClick={() => setCurrentLesson(lesson.id)}
                            >
                              <div className="flex items-center space-x-3 w-full">
                                {lesson.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                )}
                                <div className="flex-1 text-left">
                                  <div className="font-medium text-sm">{lesson.title}</div>
                                  <div className="text-xs text-gray-500">{lesson.duration}</div>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-4">
                  {currentLessonData?.documents && currentLessonData.documents.length > 0 ? (
                    <div className="space-y-3">
                      {currentLessonData.documents.map((doc, index) => (
                        <Card key={index} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-blue-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{doc}</p>
                              <p className="text-xs text-gray-500">PDF • 2.5 MB</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Bài học này không có tài liệu đi kèm</p>
                    </div>
                  )}

                  <Separator className="my-6" />

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Mô tả bài học</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Trong bài học này, bạn sẽ được tìm hiểu về các khái niệm cơ bản của web development, bao gồm cách thức
                      hoạt động của web, các công nghệ frontend và backend, cũng như roadmap để trở thành một web developer
                      chuyên nghiệp.
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
          </div>

          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-4">
              {currentLessonData?.documents && currentLessonData.documents.length > 0 ? (
                <div className="space-y-3">
                  {currentLessonData.documents.map((doc, index) => (
                    <Card key={index} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc}</p>
                          <p className="text-xs text-gray-500">PDF • 2.5 MB</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Bài học này không có tài liệu đi kèm</p>
                </div>
              )}

              <Separator className="my-6" />

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Mô tả bài học</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Trong bài học này, bạn sẽ được tìm hiểu về các khái niệm cơ bản của web development, bao gồm cách thức
                  hoạt động của web, các công nghệ frontend và backend, cũng như roadmap để trở thành một web developer
                  chuyên nghiệp.
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
