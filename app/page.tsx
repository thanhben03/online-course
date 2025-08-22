import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BookOpen,
    Clock,
    Users,
    Star,
    Award,
    Play,
    CheckCircle,
    Globe,
    Shield,
    Zap,
    TrendingUp,
    GraduationCap,
    Target,
    Heart,
    MessageCircle,
    ArrowRight,
} from "lucide-react";
import Header from "@/components/header";
import { courseService } from "@/lib/services/courseService";
import { randomInt } from "node:crypto";
import { formatDuration, formatPrice } from "@/lib/utils";

const instructors = [
    {
        id: 1,
        name: "Nguyễn Hoàng Duy",
        title: "Admin/Founder",
        company: "Olympic Toán Giải Tích",
        avatar: "/placeholder-user.jpg",
        courses: 7,
        students: 80,
        rating: 4.8,
        expertise: ["VJIMC", "Olympic Toán Giải Tích", "Manim"],
    }
];

const features = [
    {
        icon: <Play className="h-8 w-8 text-blue-600" />,
        title: "Bài giảng bài bản",
        description:
            "Bài giảng được thiết kế bài bản từ cơ bản đến nâng cao, bám sát cấu trúc và dạng bài của các kỳ thi Olympic Toán. ",
    },
    {
        icon: <CheckCircle className="h-8 w-8 text-green-600" />,
        title: "Đánh giá tiến độ",
        description:
            "Dễ dàng đánh giá tiến độ học tập của bản thân theo dỗi quá trình học tập, và mức độ hoàn thành từng chuyên đề, mục tiêu điều chỉnh chiến lược học tập hiệu quả",
    },
    {
        icon: <Users className="h-8 w-8 text-purple-600" />,
        title: "Cộng đồng Olympic",
        description:
            "Cộng đồng học viên Olympic: Kết nối với những bạn đam mê toán trên khắp cả nước, chia sẽ kinh nghiệm và cùng nhau giải quyết các bài toán khó.",
    },
    {
        icon: <Zap className="h-8 w-8 text-yellow-600" />,
        title: "Cập nhật liên tục",
        description:
            "Nội dung được bổ sung thường xuyên với các bài toán mới, đề thi thực tế và phương pháp giải hiện đại.",
    },
];

const testimonials = [
    {
        id: 1,
        name: "Nguyễn Thị Tuyết Nhi",
        role: "Học viên Olympic Toán",
        avatar: "/placeholder-user.jpg",
        content:
            "Cảm ơn anh ạ, thực sự tự đọc giáo trình em chả hiểu gì luôn. Lần đầu tiên, em thấy có kênh Việt Nam miêu tả trực quan các định nghĩa toán học như thế này. Ngày trước em phải tự mò qua các kênh nước ngoài xem, kênh rất hay nên anh tiếp tục làm video nhé.",
        rating: 5,
    },
    {
        id: 2,
        name: "Trần Văn Sơn",
        role: "Học viên Olympic Toán",
        avatar: "/placeholder-user.jpg",
        content:
            "Em 2k7 chuẩn bị lên Đại học chưa biết cái gì nhưng mà xem qua list video 1 năm trước của anh vẫn thấy hay mặc dù xem 2 đến 3 lần em mới hiểu. Em nghĩ anh đã ở ẩn nhưng giờ rất vui khi thấy sự comeback này ạ. Chúc anh nhiều may mắn và thành công.",
        rating: 5,
    },
    {
        id: 3,
        name: "Lê Thị Hồng Nhung",
        role: "Học viên Olympic Toán",
        avatar: "/placeholder-user.jpg",
        content:
            "Thật sự thì e rất cảm ơn video của a rất nhiều ấy nhờ vid của a mà e có đc nhưng kiến thức nền tảng ấy ạ bản thân e trong đt của trường mà nhờ kt của a truyền đạt mà e đã hơn hầu hết mn về phần dãy ấy ạ, mà nó lại còn miễn phí chứ học mấy thầy nỗi tiếng đắt chetme:)),clip còn chất lượng dễ hiểu nắm toàn bộ kt sơ khai và các công cụ hướng tiếp cận cho các bài toán nữa,hy vọng a làm thêm vài clip nói về công cụ và hướng tiếp cận 1 bài dãy vd: bất  đẳng thức tích phân, khai triển taylor-maclaurrin,các bổ đề giới hạn,đl lagrange,... hy vọng a làm ạ e cảm ơn a và chúc a sẽ thành công trên con đường giảng dạy",
        rating: 4,
    },
];

const stats = [
    {
        number: "2,000+",
        label: "Subscribers",
        icon: <Users className="h-6 w-6" />,
    },
    { number: "7", label: "Chuyên đề", icon: <BookOpen className="h-6 w-6" /> },
    {
        number: "24/7",
        label: "Hỗ trợ",
        icon: <MessageCircle className="h-6 w-6" />,
    },
];

export default async function HomePage() {
    const courses = await courseService.getAllCourses();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Header */}
            <Header variant="default" />

            {/* Hero Banner */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="container mx-auto text-center">
                    <div className="max-w-4xl mx-auto">
                        <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Olympic toán giải tích
                        </Badge>
                        <h1 className="text-4xl md:text-4xl font-bold text-gray-900 mb-6">
                            Khoá học Olympic toán Giải tích từ cơ bản đến
                            <span className="text-blue-600"> nâng cao</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Từ lý thuyết nền tảng đến kỹ thuật giải các bài toán
                            nâng cao, với các bài giảng chất lượng, trực quan,
                            dễ hiểu.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <Link href="/login">
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                                >
                                    Đăng nhập để học ngay
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="lg"
                                className="px-8 py-3 bg-transparent"
                            >
                                Khám phá khóa học
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-3  gap-6 max-w-3xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="flex items-center justify-center mb-2 text-blue-600">
                                        {stat.icon}
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute inset-0 -z-10">
                    <Image
                        src="/placeholder.svg?height=600&width=1200"
                        alt="Online Learning"
                        fill
                        className="object-cover opacity-10"
                    />
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Tại sao chọn Nhật Minh Anh Education?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Chúng tôi cung cấp trải nghiệm học tập tốt nhất với
                            những tính năng độc đáo
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <CardContent className="p-6">
                                    <div className="flex justify-center mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Courses Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Chuyên đề nổi bật
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Khám phá các chuyên đề được yêu thích nhất với nội
                            dung chất lượng cao và phương pháp giảng dạy hiện
                            đại.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {courses.map((course) => (
                            <Card
                                key={course.id}
                                className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md"
                            >
                                <CardHeader className="p-0">
                                    <div className="relative overflow-hidden rounded-t-lg">
                                        <Image
                                            src={
                                                course.thumbnail_url ||
                                                "/placeholder.svg"
                                            }
                                            alt={course.title}
                                            width={300}
                                            height={200}
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <Badge
                                                variant="secondary"
                                                className="bg-white/90 text-gray-700"
                                            >
                                                {course.total_lessons} bài
                                            </Badge>
                                        </div>

                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-yellow-500 text-white">
                                                <Star className="h-3 w-3 mr-1" />
                                                Nổi bật
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {course.title}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-sm text-gray-600 line-clamp-2 mb-3">
                                        {course.description}
                                    </CardDescription>

                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="h-4 w-4" />
                                            <span>
                                                {course.total_lessons} bài
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {formatDuration(
                                                    course.total_duration
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {randomInt(1000, 10000)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                            <span className="text-sm font-medium">
                                                {randomInt(4, 5)}
                                            </span>
                                        </div>
                                        <span className="text-sm text-green-600 font-medium">
                                            {/* {formatPrice(course.price)} */}
                                        </span>
                                    </div>

                                    <div className="text-xs text-gray-500 mb-3">
                                        Giảng viên: Nguyễn Hoàng Duy
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Link
                                        href={`/course/${course.id}`}
                                        className="w-full"
                                    >
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                            Xem chi tiết
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Link href="/courses">
                            <Button
                                variant="outline"
                                size="lg"
                                className="px-8"
                            >
                                Xem tất cả khóa học
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Instructors Section */}
            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Người đồng hành
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Người sẵn sàng chia sẻ và hỗ trợ bạn trên con đường chinh phục giải tích
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-5xl mx-auto">
                        {instructors.map((instructor) => (
                            <Card
                                key={instructor.id}
                                className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <CardContent className="p-6">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                                        <Image
                                            src={instructor.avatar}
                                            alt={instructor.name}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {instructor.name}
                                    </h3>
                                    <p className="text-sm text-blue-600 mb-1">
                                        {instructor.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mb-3">
                                        {instructor.company}
                                    </p>

                                    <div className="flex items-center justify-center gap-1 mb-3">
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                        <span className="text-sm font-medium">
                                            {instructor.rating}
                                        </span>
                                    </div>

                                    <div className="flex justify-center gap-4 text-xs text-gray-500 mb-4">
                                        <span>
                                            {instructor.courses} khóa học
                                        </span>
                                        <span>
                                            {instructor.students} bài giảng
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-1">
                                        {instructor.expertise.map(
                                            (skill, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {skill}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Học viên nói gì?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Những phản hồi chân thực từ học viên đã hoàn thành
                            khóa học
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {testimonials.map((testimonial) => (
                            <Card
                                key={testimonial.id}
                                className="border-0 shadow-lg"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map(
                                            (_, i) => (
                                                <Star
                                                    key={i}
                                                    className="h-4 w-4 text-yellow-500 fill-current"
                                                />
                                            )
                                        )}
                                    </div>

                                    <p className="text-gray-600 mb-4 italic">
                                        "{testimonial.content}"
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            <Image
                                                src={testimonial.avatar}
                                                alt={testimonial.name}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {testimonial.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {testimonial.role}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-blue-600">
                <div className="container mx-auto text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Để đảm bảo chất lượng và thời gian quan tâm cho người học
                        </h2>
                        <div className="mb-8">
                            <div className="inline-block relative">
                                <p className="text-2xl md:text-3xl font-bold text-yellow-300 mb-2 animate-pulse">
                                    🔥 Mỗi năm chỉ nhận 30 sinh viên 🔥
                                </p>

                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/login">
                                <Button
                                    size="lg"
                                    className="bg-white text-black hover:bg-gray-100 px-8 py-3"
                                >
                                    Học phí 1.500.000 VNĐ
                                </Button>
                            </Link>
                            <Link href="/courses">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-white text-black hover:bg-white hover:text-blue-600 px-8 py-3"
                                >
                                    7 chuyên đề
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <BookOpen className="h-8 w-8 text-blue-400" />
                                <span className="text-xl font-bold">
                                    Nhật Minh Anh Education
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">
                                Nền tảng học tập trực tuyến Olympic Toán Giải Tích, Toán THPT, Manim
                            </p>
                            <div className="flex space-x-4">
                                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                    <Award className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Khóa học</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Olympic Toán Giải Tích
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Toán THPT
                                    </Link>
                                </li>
                                
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Ứng dụng Manim trong dạy học
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Trung tâm trợ giúp
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Liên hệ
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Chính sách bảo mật
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Điều khoản sử dụng
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Liên hệ</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>Email: support@eduplatform.vn</li>
                                <li>Hotline: 1900 1234</li>
                                <li>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                        <p>
                            &copy; 2024 EduPlatform. Tất cả quyền được bảo lưu.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
