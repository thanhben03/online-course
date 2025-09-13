'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X, GripVertical } from 'lucide-react';
import { Instructor, CreateInstructorData, UpdateInstructorData } from '@/lib/services/instructorService';
import { AvatarUpload } from '@/components/AvatarUpload';

export default function InstructorManagement() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateInstructorData>({
    name: '',
    title: '',
    company: '',
    avatar_url: '/placeholder-user.jpg',
    courses_count: 0,
    lessons_count: 0,
    rating: 5.0,
    expertise: [] as string[],
    order_index: 0
  });
  const [newSkill, setNewSkill] = useState('');
  const { toast } = useToast();

  // Fetch instructors
  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/admin/instructors');
      if (response.ok) {
        const data = await response.json();
        setInstructors(data.instructors);
      } else {
        throw new Error('Failed to fetch instructors');
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách giảng viên',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      company: '',
      avatar_url: '/placeholder-user.jpg',
      courses_count: 0,
      lessons_count: 0,
      rating: 5.0,
      expertise: [],
      order_index: 0
    });
    setNewSkill('');
    setShowForm(false);
    setEditingId(null);
  };

  // Add skill to expertise
  const addSkill = () => {
    if (newSkill.trim() && !formData.expertise.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  // Remove skill from expertise
  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(s => s !== skill)
    }));
  };

  // Create new instructor
  const createInstructor = async () => {
    try {
      const response = await fetch('/api/admin/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Thành công',
          description: 'Đã tạo giảng viên mới'
        });
        resetForm();
        fetchInstructors();
      } else {
        throw new Error('Failed to create instructor');
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo giảng viên mới',
        variant: 'destructive'
      });
    }
  };

  // Update instructor
  const updateInstructor = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/instructors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật thông tin giảng viên'
        });
        resetForm();
        fetchInstructors();
      } else {
        throw new Error('Failed to update instructor');
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin giảng viên',
        variant: 'destructive'
      });
    }
  };

  // Delete instructor
  const deleteInstructor = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa giảng viên này?')) return;

    try {
      const response = await fetch(`/api/admin/instructors/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Thành công',
          description: 'Đã xóa giảng viên'
        });
        fetchInstructors();
      } else {
        throw new Error('Failed to delete instructor');
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa giảng viên',
        variant: 'destructive'
      });
    }
  };

  // Start editing
  const startEdit = (instructor: Instructor) => {
    setFormData({
      name: instructor.name,
      title: instructor.title,
      company: instructor.company,
      avatar_url: instructor.avatar_url,
      courses_count: instructor.courses_count,
      lessons_count: instructor.lessons_count,
      rating: instructor.rating,
      expertise: [...instructor.expertise],
      order_index: instructor.order_index
    });
    setEditingId(instructor.id);
    setShowForm(true);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateInstructor(editingId);
    } else {
      createInstructor();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Giảng viên</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const response = await fetch('/api/init-instructors', { method: 'POST' });
                if (response.ok) {
                  toast({
                    title: 'Thành công',
                    description: 'Đã khởi tạo bảng instructors'
                  });
                  fetchInstructors();
                } else {
                  throw new Error('Failed to initialize');
                }
              } catch (error) {
                toast({
                  title: 'Lỗi',
                  description: 'Không thể khởi tạo bảng instructors',
                  variant: 'destructive'
                });
              }
            }}
          >
            🗄️ Khởi tạo DB
          </Button>
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const response = await fetch('/api/debug-instructors');
                if (response.ok) {
                  const data = await response.json();
                  console.log('🔍 Debug data:', data);
                  toast({
                    title: 'Debug Info',
                    description: `Bảng: ${data.tableExists}, Tổng: ${data.allInstructorsCount}, Hoạt động: ${data.activeInstructorsCount}`
                  });
                } else {
                  throw new Error('Failed to debug');
                }
              } catch (error) {
                toast({
                  title: 'Lỗi',
                  description: 'Không thể debug database',
                  variant: 'destructive'
                });
              }
            }}
          >
            🐛 Debug DB
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm giảng viên
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên mới'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tên giảng viên *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="title">Chức danh *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company">Công ty/Đơn vị *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Ảnh đại diện</Label>
                  <div className="flex gap-4 items-start">
                    <AvatarUpload
                      currentAvatarUrl={formData.avatar_url}
                      instructorId={editingId || 'new'}
                      instructorName={formData.name || 'Giảng viên mới'}
                      onUploadSuccess={(newAvatarUrl) => {
                        setFormData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
                      }}
                      size="lg"
                      disabled={!editingId} // Chỉ cho phép upload khi đang edit instructor đã tồn tại
                    />
                    <div className="flex-1">
                      <Label htmlFor="avatar_url">Hoặc nhập URL trực tiếp</Label>
                      <Input
                        id="avatar_url"
                        value={formData.avatar_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                        placeholder="/placeholder-user.jpg"
                      />
                      {editingId ? (
                        <p className="text-xs text-green-600 mt-1">
                          ✅ Có thể upload ảnh mới
                        </p>
                      ) : (
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ Tạo giảng viên trước khi upload ảnh
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="courses_count">Số khóa học</Label>
                  <Input
                    id="courses_count"
                    type="number"
                    value={formData.courses_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, courses_count: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lessons_count">Số bài giảng</Label>
                  <Input
                    id="lessons_count"
                    type="number"
                    value={formData.lessons_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, lessons_count: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Đánh giá (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 5.0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="order_index">Thứ tự hiển thị</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label>Kỹ năng chuyên môn</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Thêm kỹ năng mới"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    Thêm
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Instructors List */}
      <div className="grid gap-4">
        {instructors.map((instructor) => (
          <Card key={instructor.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img
                        src={instructor.avatar_url}
                        alt={instructor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <AvatarUpload
                      currentAvatarUrl={instructor.avatar_url}
                      instructorId={instructor.id}
                      instructorName={instructor.name}
                      onUploadSuccess={(newAvatarUrl) => {
                        // Cập nhật state local để hiển thị ngay
                        setInstructors(prev => 
                          prev.map(inst => 
                            inst.id === instructor.id 
                              ? { ...inst, avatar_url: newAvatarUrl }
                              : inst
                          )
                        );
                      }}
                      size="sm"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{instructor.name}</h3>
                    <p className="text-gray-600">{instructor.title}</p>
                    <p className="text-sm text-gray-500">{instructor.company}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>⭐ {instructor.rating}</span>
                      <span>📚 {instructor.courses_count} khóa học</span>
                      <span>🎥 {instructor.lessons_count} bài giảng</span>
                      <span>📌 {instructor.order_index}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {instructor.expertise.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(instructor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteInstructor(instructor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {instructors.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Chưa có giảng viên nào. Hãy thêm giảng viên đầu tiên!
        </div>
      )}
    </div>
  );
}
