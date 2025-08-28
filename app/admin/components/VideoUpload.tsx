"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Upload,
    FileVideo,
    File,
    Trash2,
    Download,
    RefreshCw,
    CheckCircle,
    Clock,
    AlertCircle,
    X,
    Edit,
} from "lucide-react";
import { getAdminHeaders } from '@/lib/api'

interface UploadedFile {
    id?: number;
    url: string;
    key: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: Date;
    s3_key?: string;
    s3_url?: string;
    filename?: string;
    original_name?: string;
    file_size?: number;
    file_type?: string;
    created_at?: string;
    lesson_id?: number | null;
    lesson_title?: string;
    course_title?: string;
}

interface Course {
    id: number;
    title: string;
}

interface Lesson {
    id: number;
    title: string;
    course_id: number;
    course_title: string;
}

export default function VideoUpload() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<UploadedFile | null>(null);
    const [editFilename, setEditFilename] = useState("");
    const [editOriginalName, setEditOriginalName] = useState("");
    const [editCourseId, setEditCourseId] = useState<number | null>(null);
    const [editLessonId, setEditLessonId] = useState<number | null>(null);

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFiles(files);
        }
    };

    // Upload files
    const handleUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            setMessage({ type: "error", text: "Vui lòng chọn file để upload" });
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // Upload từng file một qua API proxy (giống upload-test)
            const uploadedResults = [];

            // Simulate progress như upload-test
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            for (const file of Array.from(selectedFiles)) {
                // Tạo FormData để gửi file (giống upload-test)
                const fileFormData = new FormData();
                fileFormData.append("file", file);

                // Upload qua proxy API (giống upload-test)
                const response = await fetch("/api/upload-proxy", {
                    method: "POST",
                    body: fileFormData,
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || "Upload failed");
                }

                // Lưu thông tin file vào database
                const saveResponse = await fetch("/api/admin/uploads", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        filename: result.fileName,
                        original_name: file.name,
                        file_size: result.fileSize,
                        file_type: result.fileType,
                        s3_key: result.key,
                        s3_url: result.url,
                        user_id: null, // Có thể thêm user ID nếu cần
                        lesson_id: selectedLessonId
                    }),
                });

                const saveResult = await saveResponse.json();
                
                if (!saveResponse.ok || !saveResult.success) {
                    console.warn("Failed to save file info to database:", saveResult.error);
                }

                const uploadedFile: UploadedFile = {
                    id: saveResult.upload?.id,
                    url: result.url,
                    key: result.key,
                    fileName: result.fileName,
                    fileSize: result.fileSize,
                    fileType: result.fileType,
                    uploadedAt: new Date(),
                };

                // Thêm vào list hiển thị
                setUploadedFiles((prev) => [uploadedFile, ...prev]);
            }

            clearInterval(progressInterval);
            setUploadProgress(100);

            setMessage({
                type: "success",
                text: `Upload thành công ${selectedFiles.length} file!`,
            });
            setSelectedFiles(null);
            setIsUploadDialogOpen(false);

            // Reset file input
            const fileInput = document.getElementById(
                "file-upload"
            ) as HTMLInputElement;
            if (fileInput) fileInput.value = "";
        } catch (error) {
            console.error("Error uploading files:", error);
            setMessage({
                type: "error",
                text: "Có lỗi xảy ra khi upload file",
            });
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Delete file from database and memory
    const handleDeleteFile = async (index: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa file này?")) {
            return;
        }

        const file = uploadedFiles[index];
        if (file.id) {
            try {
                const response = await fetch(`/api/admin/uploads/${file.id}`, {
                    method: "DELETE",
                });
                const result = await response.json();
                
                if (!response.ok || !result.success) {
                    setMessage({ type: "error", text: result.error || "Lỗi khi xóa file" });
                    return;
                }
            } catch (error) {
                console.error("Error deleting file:", error);
                setMessage({ type: "error", text: "Lỗi khi xóa file" });
                return;
            }
        }

        // Remove from local state
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
        setMessage({ type: "success", text: "Xóa file thành công!" });
    };

    // Copy URL to clipboard (giống upload-test)
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setMessage({ type: "success", text: "Đã copy URL vào clipboard!" });
        setTimeout(() => setMessage(null), 2000);
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Get file type icon
    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith("video/")) {
            return <FileVideo className="h-4 w-4 text-blue-500" />;
        }
        return <File className="h-4 w-4 text-gray-500" />;
    };

    // Simulate upload progress (since we don't have real-time progress)
    useEffect(() => {
        if (uploading) {
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 500);

            return () => clearInterval(interval);
        }
    }, [uploading]);

    // Fetch files từ database khi component mount
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/admin/uploads");
                const data = await response.json();
                
                if (data.success && data.files) {
                    // Convert database format to component format
                    const files: UploadedFile[] = data.files.map((file: any) => ({
                        id: file.id,
                        url: file.s3_url || `https://s3-hcm5-r1.longvan.net/${process.env.NEXT_PUBLIC_AWS_S3_BUCKET || '19428351-course'}/${file.s3_key}`,
                        key: file.s3_key,
                        fileName: file.filename,
                        fileSize: file.file_size,
                        fileType: file.file_type,
                        uploadedAt: new Date(file.created_at),
                        lesson_id: file.lesson_id,
                        lesson_title: file.lesson_title,
                        course_title: file.course_title,
                    }));
                    setUploadedFiles(files);
                } else {
                    console.error("Failed to fetch files:", data.error);
                }
            } catch (error) {
                console.error("Error fetching files:", error);
                setMessage({ type: "error", text: "Lỗi khi tải danh sách file" });
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, []);

    // Fetch courses và lessons khi component mount
    useEffect(() => {
        const fetchCoursesAndLessons = async () => {
            try {
                // Fetch courses
                const coursesResponse = await fetch("/api/admin/courses", {
                    headers: { ...getAdminHeaders() },
                });
                const coursesData = await coursesResponse.json();
                
                if (coursesData.success && coursesData.courses) {
                    setCourses(coursesData.courses);
                }

                // Fetch lessons
                const lessonsResponse = await fetch("/api/admin/lessons", {
                    headers: { ...getAdminHeaders() },
                });
                const lessonsData = await lessonsResponse.json();
                
                if (lessonsData.success && lessonsData.lessons) {
                    setLessons(lessonsData.lessons);
                }
            } catch (error) {
                console.error("Error fetching courses and lessons:", error);
            }
        };

        fetchCoursesAndLessons();
    }, []);

    // Filter lessons based on selected course
    const filteredLessons = selectedCourseId 
        ? lessons.filter(lesson => lesson.course_id === selectedCourseId)
        : [];

    // Filter lessons for edit dialog
    const editFilteredLessons = editCourseId 
        ? lessons.filter(lesson => lesson.course_id === editCourseId)
        : [];

    // Open edit dialog
    const openEditDialog = (file: UploadedFile) => {
        setEditingFile(file);
        setEditFilename(file.fileName);
        setEditOriginalName(file.original_name || file.fileName);
        
        // Find course ID from lesson
        const lesson = lessons.find(l => l.id === file.lesson_id);
        setEditCourseId(lesson?.course_id || null);
        setEditLessonId(file.lesson_id || null);
        setIsEditDialogOpen(true);
    };

    // Handle edit file
    const handleEditFile = async () => {
        if (!editingFile) return;

        try {
            const response = await fetch("/api/admin/uploads", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: editingFile.id,
                    filename: editFilename,
                    original_name: editOriginalName,
                    lesson_id: editLessonId,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setMessage({ type: "error", text: result.error || "Lỗi khi cập nhật file" });
                return;
            }

            // Update file in local state
            setUploadedFiles(prev => prev.map(file => 
                file.id === editingFile.id 
                    ? {
                        ...file,
                        fileName: editFilename,
                        original_name: editOriginalName,
                        lesson_id: editLessonId,
                        lesson_title: lessons.find(l => l.id === editLessonId)?.title,
                        course_title: courses.find(c => c.id === editCourseId)?.title,
                    }
                    : file
            ));

            setMessage({ type: "success", text: "Cập nhật thông tin file thành công!" });
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error("Error updating file:", error);
            setMessage({ type: "error", text: "Lỗi khi cập nhật file" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Upload video/tài liệu
                    </h2>
                    <p className="text-gray-600">
                        Tải lên video và tài liệu cho khóa học
                    </p>
                </div>

                <Dialog
                    open={isUploadDialogOpen}
                    onOpenChange={setIsUploadDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload file
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Upload file mới</DialogTitle>
                            <DialogDescription>
                                Chọn video hoặc tài liệu để upload lên hệ thống
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course-select">Chọn khóa học</Label>
                                    <Select
                                        value={selectedCourseId?.toString() || ""}
                                        onValueChange={(value) => {
                                            const courseId = value && value !== "" ? parseInt(value) : null;
                                            setSelectedCourseId(courseId);
                                            setSelectedLessonId(null); // Reset lesson khi đổi course
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn khóa học..." />
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
                                    <Label htmlFor="lesson-select">Chọn bài học</Label>
                                    <Select
                                        value={selectedLessonId?.toString() || ""}
                                        onValueChange={(value) => {
                                            const lessonId = value && value !== "" ? parseInt(value) : null;
                                            setSelectedLessonId(lessonId);
                                        }}
                                        disabled={!selectedCourseId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={
                                                selectedCourseId ? "Chọn bài học..." : "Chọn khóa học trước..."
                                            } />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredLessons.map((lesson) => (
                                                <SelectItem key={lesson.id} value={lesson.id.toString()}>
                                                    {lesson.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file-upload">Chọn file</Label>
                                <Input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    accept="video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                                    onChange={handleFileSelect}
                                    className="cursor-pointer"
                                />
                                <p className="text-xs text-gray-500">
                                    Hỗ trợ: Video, Audio, PDF, Word, PowerPoint,
                                    Excel, Text
                                </p>
                            </div>

                            {selectedFiles && selectedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <Label>File đã chọn:</Label>
                                    <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                                        {Array.from(selectedFiles).map(
                                            (file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between py-1"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {getFileIcon(file.type)}
                                                        <span className="text-sm">
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {formatFileSize(
                                                            file.size
                                                        )}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {uploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Tiến trình upload</Label>
                                        <span className="text-xs text-gray-500">
                                            {Math.round(uploadProgress)}%
                                        </span>
                                    </div>
                                    <Progress value={uploadProgress} />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsUploadDialogOpen(false);
                                    setSelectedFiles(null);
                                    setUploadProgress(0);
                                    setSelectedCourseId(null);
                                    setSelectedLessonId(null);
                                }}
                                disabled={uploading}
                            >
                                {uploading ? "Đang upload..." : "Hủy"}
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={
                                    !selectedFiles ||
                                    selectedFiles.length === 0 ||
                                    uploading
                                }
                            >
                                {uploading ? "Đang upload..." : "Upload"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit File Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa thông tin file</DialogTitle>
                            <DialogDescription>
                                Cập nhật thông tin file đã upload
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-filename">Tên file hiển thị</Label>
                                <Input
                                    id="edit-filename"
                                    value={editFilename}
                                    onChange={(e) => setEditFilename(e.target.value)}
                                    placeholder="Nhập tên file..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-original-name">Tên file gốc</Label>
                                <Input
                                    id="edit-original-name"
                                    value={editOriginalName}
                                    onChange={(e) => setEditOriginalName(e.target.value)}
                                    placeholder="Nhập tên file gốc..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-course-select">Chọn khóa học</Label>
                                    <Select
                                        value={editCourseId?.toString() || "none"}
                                        onValueChange={(value) => {
                                            const courseId = value && value !== "none" ? parseInt(value) : null;
                                            setEditCourseId(courseId);
                                            setEditLessonId(null); // Reset lesson khi đổi course
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn khóa học..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Không chọn khóa học</SelectItem>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                    {course.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-lesson-select">Chọn bài học</Label>
                                    <Select
                                        value={editLessonId?.toString() || "none"}
                                        onValueChange={(value) => {
                                            const lessonId = value && value !== "none" ? parseInt(value) : null;
                                            setEditLessonId(lessonId);
                                        }}
                                        disabled={!editCourseId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={
                                                editCourseId ? "Chọn bài học..." : "Chọn khóa học trước..."
                                            } />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Không chọn bài học</SelectItem>
                                            {editFilteredLessons.map((lesson) => (
                                                <SelectItem key={lesson.id} value={lesson.id.toString()}>
                                                    {lesson.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {editingFile && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Thông tin file hiện tại:</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><strong>S3 Key:</strong> {editingFile.key}</p>
                                        <p><strong>Loại file:</strong> {editingFile.fileType}</p>
                                        <p><strong>Kích thước:</strong> {formatFileSize(editingFile.fileSize)}</p>
                                        <p><strong>Ngày upload:</strong> {editingFile.uploadedAt.toLocaleString('vi-VN')}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false);
                                    setEditingFile(null);
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleEditFile}
                                disabled={!editFilename.trim()}
                            >
                                Cập nhật
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Alert Messages */}
            {message && (
                <Alert
                    className={`${
                        message.type === "success"
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                    }`}
                >
                    <AlertDescription
                        className={
                            message.type === "success"
                                ? "text-green-800"
                                : "text-red-800"
                        }
                    >
                        {message.text}
                    </AlertDescription>
                </Alert>
            )}

            {/* File List */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Danh sách file đã upload</CardTitle>
                            <CardDescription>
                                {loading ? "Đang tải..." : `Tổng cộng ${uploadedFiles.length} file`}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File</TableHead>
                                    <TableHead>Khóa học / Bài học</TableHead>
                                    <TableHead>S3 Key</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Kích thước</TableHead>
                                    <TableHead>Ngày upload</TableHead>
                                    <TableHead className="text-right">
                                        Thao tác
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                                            Đang tải danh sách file...
                                        </TableCell>
                                    </TableRow>
                                ) : uploadedFiles.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            Chưa có file nào được upload
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    uploadedFiles.map((file, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getFileIcon(file.fileType)}
                                                    <span className="font-medium">
                                                        {file.fileName}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {file.course_title || file.lesson_title ? (
                                                    <div className="text-sm">
                                                        {file.course_title && (
                                                            <div className="font-medium text-blue-600">
                                                                {file.course_title}
                                                            </div>
                                                        )}
                                                        {file.lesson_title && (
                                                            <div className="text-gray-600">
                                                                {file.lesson_title}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">
                                                        Chưa gán bài học
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate font-mono text-xs">
                                                {file.key}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {file.fileType}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {formatFileSize(file.fileSize)}
                                            </TableCell>
                                            <TableCell>
                                                {file.uploadedAt.toLocaleString(
                                                    "vi-VN"
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                file.url
                                                            )
                                                        }
                                                        title="Copy URL"
                                                    >
                                                        Copy
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            window.open(
                                                                file.url,
                                                                "_blank"
                                                            )
                                                        }
                                                        title="Tải về"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(file)}
                                                        title="Chỉnh sửa"
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteFile(
                                                                index
                                                            )
                                                        }
                                                        title="Xóa"
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
        </div>
    );
}
