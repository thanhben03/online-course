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
    Star,
    Users,
    Award,
    MapPin,
    Calendar,
    GraduationCap,
    Target,
    TrendingUp,
    Play,
    MessageCircle,
    Mail,
    Phone,
    Globe,
    Linkedin,
    Youtube,
    Clock,
} from "lucide-react";
import Header from "@/components/header";
import { siteSettingsService } from "@/lib/services/siteSettingsService";
import TestimonialsSlider from "@/components/TestimonialsSlider";

// Dữ liệu giảng viên mẫu - fallback
// const instructor = {
//     id: 1,
//     name: "Nguyễn Hoàng Duy",
//     title: "Admin/Founder",
//     bio: "Giảng viên Olympic Toán với 5 năm kinh nghiệm giảng dạy và nghiên cứu. Chuyên gia về Giải tích, Đại số và Hình học. Từng đạt giải cao tại các kỳ thi Olympic Toán quốc tế và hiện đang phụ trách nhiều chuyên đề toán học nâng cao.",
//     company: "Olympic Toán Giải Tích",
//     avatar: "/placeholder-user.jpg",
//     courses: 7,
//     students: 2500,
//     rating: 4.9,
//     totalRatings: 450,
//     expertise: ["Olympic Toán", "Giải Tích", "Toán THPT", "Manim", "VJIMC"],
//     education: [
//         {
//             degree: "Thạc sĩ Toán ứng dụng",
//             school: "Đại học Cần Thơ",
//             year: "2025-2027"
//         },
//         {
//             degree: "Cử nhân Sư phạm Toán học - K47",
//             school: "Trường Sư phạm - Đại học Cần Thơ",
//             year: "2021-2025"
//         },
//         {
//             degree: "Du học - thực tập",
//             school: "Đại học Ostra - Cộng Hoà Séc",
//             year: "8/2024 - 7/2025"
//         }
//     ],
//     achievements: [
//         "Học bổng du học Châu Âu",
//         "Top 1 (BXH ĐHCT) VJIMC 2025",
//         "Giải nhất NCKH (ĐHCT) Ứng dụng Manim trong dạy học Toán",
//         "300+ member"
//     ],
//     experience: [
//         {
//             position: "Founder & Giảng viên chính",
//             company: "Olympic Toán Giải Tích",
//             period: "2023 - Hiện tại",
//             description: "Xây dựng và phát triển nền tảng học tập Olympic Toán trực tuyến, thiết kế chương trình học và giảng dạy trực tiếp."
//         },
//         {
//             position: "Giáo viên Toán",
//             company: "Hệ thống giáo dục Akadon Education",
//             period: "2021 - Hiện tại",
//             description: ""
//         }
//     ],
//     contact: {
//         email: "duy@olympicmath.vn",
//         phone: "+84 987 654 321",
//         website: "https://olympicmath.vn",
//         linkedin: "https://linkedin.com/in/nguyenhoangduy",
//         youtube: "https://youtube.com/@olympicmath"
//     },
//     teachingPhilosophy: "Toán học không chỉ là những con số và công thức, mà là cách tư duy logic và giải quyết vấn đề. Tôi tin rằng mọi học sinh đều có thể làm chủ toán học nếu được hướng dẫn đúng cách và có động lực phù hợp.",
//     stats: [
//         { label: "Năm kinh nghiệm", value: "5", icon: <Calendar className="h-5 w-5" /> },
//         { label: "Subscribers", value: "2,500+", icon: <Users className="h-5 w-5" /> },
//         { label: "Khoá học", value: "7", icon: <BookOpen className="h-5 w-5" /> },
//         { label: "Đánh giá", value: "4.9/5", icon: <Star className="h-5 w-5" /> }
//     ]
// };

async function getInstructorContent() {
    const keys = [
        'instructor_name','instructor_title','instructor_company','instructor_avatar',
        'instructor_bio','instructor_students','instructor_rating','instructor_total_ratings',
        'instructor_courses','instructor_expertise_csv','instructor_achievements_csv','instructor_education'
    ];
    try {
        const map = await siteSettingsService.getByKeys(keys);
        console.log(map);
        const expertise = (map['instructor_expertise_csv'] || '').split(',').map(s => s.trim()).filter(Boolean);
        const achievements = (map['instructor_achievements_csv'] || '').split(',').map(s => s.trim()).filter(Boolean);
        const education = (() => {
            try {
                const raw = map['instructor_education'];
                const arr = JSON.parse(raw || '[]');
                return Array.isArray(arr) ? arr : [];
            } catch { return []; }
        })();

        return {
            name: map['instructor_name'],
            title: map['instructor_title'],
            company: map['instructor_company'],
            avatar: map['instructor_avatar'],
            bio: map['instructor_bio'],
            students: Number(map['instructor_students']),
            rating: Number(map['instructor_rating']),
            totalRatings: Number(map['instructor_total_ratings']),
            courses: Number(map['instructor_courses']) || 0,
            expertise: expertise.length ? expertise : [],
            achievements: achievements.length ? achievements : [],
            education: education.length ? education : [],
            experience: [],
        };
    } catch {
        return {};
    }
}

async function getHomepageTestimonials() {
    try {
        const map = await siteSettingsService.getByKeys(['homepage_testimonials']);
        const raw = map['homepage_testimonials'];
        if (!raw) return [] as any[];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [] as any[];
    }
}

// Dynamic rendering is now handled globally in layout.tsx

export default async function InstructorsPage() {
    const merged = await getInstructorContent();
    const testimonials = await getHomepageTestimonials();
    
    // Debug: Log timestamp to check if page is being re-rendered
    console.log('🕐 Instructors page rendered at:', new Date().toISOString());
    console.log('📊 Instructor data:', merged);
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <Header variant="default" />
            
            {/* Hero Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Profile Card */}
                            <div className="lg:col-span-1">
                                <Card className="border-0 shadow-xl sticky top-4">
                                    <CardContent className="p-6">
                                        <div className="text-center">
                                            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
                                                <Image
                                                    src={merged.avatar || ''}
                                                    alt={merged.name || ''}
                                                    width={128}
                                                    height={128}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                                {merged.name}
                                            </h1>
                                            <p className="text-lg text-blue-600 mb-2">
                                                {merged.title}
                                            </p>
                                            <p className="text-gray-600 mb-4">
                                                {merged.company}
                                            </p>
                                            
                                            {/* Rating */}
                                            <div className="flex items-center justify-center gap-2 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                                                    <span className="font-bold text-lg">{merged.rating}</span>
                                                </div>
                                                <span className="text-gray-500">
                                                    ({merged.totalRatings} đánh giá)
                                                </span>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                {[{ label: "Năm kinh nghiệm", value: "5" }, { label: "Subscribers", value: "2,500+" }, { label: "Khoá học", value: String(merged.courses || 0) }, { label: "Đánh giá", value: `${merged.rating}/5` }].map((stat, index) => (
                                                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center justify-center mb-1 text-blue-600"></div>
                                                        <div className="font-bold text-lg text-gray-900">
                                                            {stat.value}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {stat.label}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Contact Buttons */}
                                            <div className="space-y-2">
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Liên hệ tư vấn
                                                </Button>
                                                <Button variant="outline" className="w-full">
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    Gửi email
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* About Section */}
                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-blue-600" />
                                            Giới thiệu
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            {merged.bio}
                                        </p>
                                        
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-gray-900 mb-2">Chuyên môn:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {merged.expertise?.map((skill: any, index: any) => (
                                                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Teaching Philosophy */}
                                {/* <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-blue-600" />
                                            Triết lý giảng dạy
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 leading-relaxed italic">
                                            "{instructor.teachingPhilosophy}"
                                        </p>
                                    </CardContent>
                                </Card> */}

                                {/* Education */}
                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5 text-blue-600" />
                                            Học vấn
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {merged.education?.map((edu: any, index: number) => (
                                                <div key={index} className="border-l-4 border-blue-600 pl-4">
                                                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                                                    <p className="text-gray-700">{edu.school}</p>
                                                    <p className="text-sm text-gray-500">{edu.year}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Experience */}
                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                            Kinh nghiệm làm việc
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {merged.experience?.map((exp: any, index: any) => (
                                                <div key={index} className="border-l-4 border-green-600 pl-4">
                                                    <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                                                    <p className="text-blue-600 font-medium">{exp.company}</p>
                                                    <p className="text-sm text-gray-500 mb-2">{exp.period}</p>
                                                    <p className="text-gray-700 text-sm">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-blue-600" />
                                            Nghiên cứu khoa học
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="list-disc list-inside text-gray-700">
                                            <li>
                                                Đề tài "Bài toán vị trí liên thông không mong muốn trên cây"
                                            </li>
                                            <li>
                                                Đề tài "Thiết kế hệ thống phương tiện trực quan bằng công cụ trí tuệ nhân tạo phục vụ dạy học Toán ở THPT theo chương trình Giáo Dục phổ thông năm 2018"
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Achievements */}
                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5 text-blue-600" />
                                            Thành tích & Chứng chỉ
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {merged.achievements?.map((achievement, index) => (
                                                <div key={index} className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                                                    <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">{achievement}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Học viên nói gì về giảng viên?
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Những phản hồi chân thực từ học viên đã học với giảng viên
                            </p>
                        </div>

                        <TestimonialsSlider testimonials={testimonials as any} />
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 px-4 bg-blue-600">
                <div className="container mx-auto">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Sẵn sàng bắt đầu hành trình học tập?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Tham gia cùng học viên đã tin tưởng
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/courses">
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                                    Xem khóa học
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                size="lg" 
                                className="border-white text-blue-600 hover:bg-white hover:text-blue-600 px-8 py-3"
                            >
                                Tư vấn miễn phí
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
