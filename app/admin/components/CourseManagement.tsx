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
  Eye,
  Users
} from "lucide-react"
import { getAdminHeaders } from '@/lib/api'

interface Course {
  id: number
  title: string
  description?: string
  thumbnail_url?: string
  price: number
  status: string
  created_at: string
  lesson_count?: number
  enrollment_count?: number
}

interface CreateCourseForm {
  title: string
  description: string
  price: string
  status: string
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  
  const [createForm, setCreateForm] = useState<CreateCourseForm>({
    title: '',
    description: '',
    price: '0',
    status: 'draft'
  })

  const statusOptions = [
    { value: 'draft', label: 'Bản nháp', color: 'gray' },
    { value: 'published', label: 'Đã xuất bản', color: 'green' },
    { value: 'archived', label: 'Lưu trữ', color: 'orange' }
  ]

  // Fetch courses from API
  const fetchCourses = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/courses', {
        headers: { ...getAdminHeaders() },
      })
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      } else {
        setMessage({ type: 'error', text: 'Lỗi khi tải danh sách khóa học' })
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi tải dữ liệu' })
    } finally {
      setLoading(false)
    }
  }

  // Create course
  const handleCreateCourse = async () => {
    if (!createForm.title) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tên khóa học' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          ...createForm,
          price: parseFloat(createForm.price) || 0
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Tạo khóa học thành công!' })
        setCreateForm({ title: '', description: '', price: '0', status: 'draft' })
        setIsCreateDialogOpen(false)
        fetchCourses()
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Lỗi khi tạo khóa học' })
      }
    } catch (error) {
      console.error('Error creating course:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi tạo khóa học' })
    } finally {
      setLoading(false)
    }
  }

  // Delete course
  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này? Tất cả bài học và dữ liệu liên quan sẽ bị xóa.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: { ...getAdminHeaders() },
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Xóa khóa học thành công!' })
        fetchCourses()
      } else {
        setMessage({ type: 'error', text: 'Lỗi khi xóa khóa học' })
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi xóa khóa học' })
    } finally {
      setLoading(false)
    }
  }

  // Update course
  const handleUpdateCourse = async () => {
    if (!selectedCourse || !selectedCourse.title) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tên khóa học' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/courses/${selectedCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedCourse.title,
          description: selectedCourse.description,
          price: selectedCourse.price,
          status: selectedCourse.status,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cập nhật khóa học thành công!' })
        setIsEditDialogOpen(false)
        setSelectedCourse(null)
        fetchCourses()
      } else {
        setMessage({ type: 'error', text: 'Lỗi khi cập nhật khóa học' })
      }
    } catch (error) {
      console.error('Error updating course:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật khóa học' })
    } finally {
      setLoading(false)
    }
  }

  // Filter courses
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusInfo = statusOptions.find(s => s.value === status)
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800',
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[statusInfo?.color as keyof typeof colorClasses] || colorClasses.gray}`}>
        {statusInfo?.label || status}
      </span>
    )
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khóa học</h2>
          <p className="text-gray-600">Tạo, sửa, xóa khóa học</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tạo khóa học mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo khóa học mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo khóa học mới
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên khóa học *</Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                  placeholder="Nhập tên khóa học"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  placeholder="Nhập mô tả khóa học"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá (VNĐ)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={createForm.price}
                    onChange={(e) => setCreateForm({...createForm, price: e.target.value})}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select value={createForm.status} onValueChange={(value) => setCreateForm({...createForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateCourse} disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo khóa học"}
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

      {/* Search and Stats */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Danh sách khóa học</CardTitle>
              <CardDescription>
                Tổng cộng {courses.length} khóa học
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchCourses} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên khóa học</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Bài học</TableHead>
                  <TableHead>Học viên</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {loading ? "Đang tải..." : "Chưa có khóa học nào"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {course.description || '-'}
                      </TableCell>
                      <TableCell>
                        {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')} VNĐ`}
                      </TableCell>
                      <TableCell>{getStatusBadge(course.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          {course.lesson_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          {course.enrollment_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(course.created_at).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCourse(course)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id)}
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

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho khóa học {selectedCourse?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Tên khóa học</Label>
                <Input
                  id="edit-title"
                  value={selectedCourse.title}
                  onChange={(e) => setSelectedCourse({...selectedCourse, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={selectedCourse.description || ''}
                  onChange={(e) => setSelectedCourse({...selectedCourse, description: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Giá (VNĐ)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    value={selectedCourse.price}
                    onChange={(e) => setSelectedCourse({...selectedCourse, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select 
                    value={selectedCourse.status} 
                    onValueChange={(value) => setSelectedCourse({...selectedCourse, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateCourse} disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
