"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getAdminHeaders } from '@/lib/api'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  BookOpen, 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  RefreshCw,
  Play,
  Clock,
  MoveUp,
  MoveDown
} from "lucide-react"

interface Course {
  id: number
  title: string
}

interface Lesson {
  id: number
  course_id: number
  course_title?: string
  title: string
  description?: string
  video_url?: string
  duration: number
  order_index: number
  created_at: string
}

interface CreateLessonForm {
  course_id: string
  title: string
  description: string
  video_url: string
  duration: string
  order_index: string
}

export default function LessonManagement() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  
  const [createForm, setCreateForm] = useState<CreateLessonForm>({
    course_id: '',
    title: '',
    description: '',
    video_url: '',
    duration: '0',
    order_index: '1'
  })

  // Fetch courses for dropdown
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        headers: { ...getAdminHeaders() },
      })
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  // Fetch lessons from API
  const fetchLessons = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/lessons', {
        headers: { ...getAdminHeaders() },
      })
      if (response.ok) {
        const data = await response.json()
        setLessons(data.lessons || [])
      } else {
        setMessage({ type: 'error', text: 'Lỗi khi tải danh sách bài học' })
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi tải dữ liệu' })
    } finally {
      setLoading(false)
    }
  }

  // Create lesson
  const handleCreateLesson = async () => {
    if (!createForm.course_id || !createForm.title) {
      setMessage({ type: 'error', text: 'Vui lòng chọn khóa học và nhập tên bài học' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          ...createForm,
          course_id: parseInt(createForm.course_id),
          duration: parseInt(createForm.duration) || 0,
          order_index: parseInt(createForm.order_index) || 1
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Tạo bài học thành công!' })
        setCreateForm({
          course_id: '', title: '', description: '', video_url: '', duration: '0', order_index: '1'
        })
        setIsCreateDialogOpen(false)
        fetchLessons()
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Lỗi khi tạo bài học' })
      }
    } catch (error) {
      console.error('Error creating lesson:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi tạo bài học' })
    } finally {
      setLoading(false)
    }
  }

  // Delete lesson
  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Xóa bài học thành công!' })
        fetchLessons()
      } else {
        setMessage({ type: 'error', text: 'Lỗi khi xóa bài học' })
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi xóa bài học' })
    } finally {
      setLoading(false)
    }
  }

  // Update lesson
  const handleUpdateLesson = async () => {
    if (!selectedLesson || !selectedLesson.title) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tên bài học' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/lessons/${selectedLesson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedLesson.title,
          description: selectedLesson.description,
          video_url: selectedLesson.video_url,
          duration: selectedLesson.duration,
          order_index: selectedLesson.order_index,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cập nhật bài học thành công!' })
        setIsEditDialogOpen(false)
        setSelectedLesson(null)
        fetchLessons()
      } else {
        setMessage({ type: 'error', text: 'Lỗi khi cập nhật bài học' })
      }
    } catch (error) {
      console.error('Error updating lesson:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật bài học' })
    } finally {
      setLoading(false)
    }
  }

  // Update lesson order
  const handleUpdateOrder = async (lessonId: number, newOrder: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_index: newOrder }),
      })

      if (response.ok) {
        fetchLessons()
      } else {
        setMessage({ type: 'error', text: 'Lỗi khi cập nhật thứ tự' })
      }
    } catch (error) {
      console.error('Error updating order:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật thứ tự' })
    } finally {
      setLoading(false)
    }
  }

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.course_title?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCourse = selectedCourse === "all" || lesson.course_id.toString() === selectedCourse
    
    return matchesSearch && matchesCourse
  })

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    fetchCourses()
    fetchLessons()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tạo chuyên mục/bài học</h2>
          <p className="text-gray-600">Quản lý bài học và chuyên mục</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tạo bài học mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo bài học mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo bài học mới
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course">Khóa học *</Label>
                <Select value={createForm.course_id} onValueChange={(value) => setCreateForm({...createForm, course_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khóa học" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Tên bài học *</Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                  placeholder="Nhập tên bài học"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  placeholder="Nhập mô tả bài học"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video_url">URL Video</Label>
                <Input
                  id="video_url"
                  value={createForm.video_url}
                  onChange={(e) => setCreateForm({...createForm, video_url: e.target.value})}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Thời lượng (giây)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={createForm.duration}
                    onChange={(e) => setCreateForm({...createForm, duration: e.target.value})}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="order_index">Thứ tự</Label>
                  <Input
                    id="order_index"
                    type="number"
                    min="1"
                    value={createForm.order_index}
                    onChange={(e) => setCreateForm({...createForm, order_index: e.target.value})}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateLesson} disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo bài học"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Messages */}
      {message && (
        <Alert className={`${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Danh sách bài học</CardTitle>
              <CardDescription>
                Tổng cộng {lessons.length} bài học
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLessons} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bài học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo khóa học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khóa học</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Tên bài học</TableHead>
                  <TableHead>Khóa học</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLessons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {loading ? "Đang tải..." : "Chưa có bài học nào"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLessons
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((lesson) => (
                      <TableRow key={lesson.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{lesson.order_index}</span>
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => handleUpdateOrder(lesson.id, lesson.order_index - 1)}
                                disabled={lesson.order_index === 1}
                              >
                                <MoveUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => handleUpdateOrder(lesson.id, lesson.order_index + 1)}
                              >
                                <MoveDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{lesson.title}</TableCell>
                        <TableCell>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {lesson.course_title}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {lesson.description || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            {formatDuration(lesson.duration)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lesson.video_url ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Play className="h-4 w-4" />
                              <span className="text-xs">Có video</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Chưa có</span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(lesson.created_at).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLesson(lesson)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Lesson Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài học</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho bài học {selectedLesson?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLesson && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Tên bài học</Label>
                <Input
                  id="edit-title"
                  value={selectedLesson.title}
                  onChange={(e) => setSelectedLesson({...selectedLesson, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={selectedLesson.description || ''}
                  onChange={(e) => setSelectedLesson({...selectedLesson, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-video-url">URL Video</Label>
                <Input
                  id="edit-video-url"
                  value={selectedLesson.video_url || ''}
                  onChange={(e) => setSelectedLesson({...selectedLesson, video_url: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Thời lượng (giây)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="0"
                    value={selectedLesson.duration}
                    onChange={(e) => setSelectedLesson({...selectedLesson, duration: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-order">Thứ tự</Label>
                  <Input
                    id="edit-order"
                    type="number"
                    min="1"
                    value={selectedLesson.order_index}
                    onChange={(e) => setSelectedLesson({...selectedLesson, order_index: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateLesson} disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
