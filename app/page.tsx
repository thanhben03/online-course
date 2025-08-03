import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  ArrowRight
} from "lucide-react"
import Header from "@/components/header"

const courses = [
  {
    id: 1,
    title: "Lập trình Web Frontend",
    description: "Học HTML, CSS, JavaScript và React từ cơ bản đến nâng cao",
    image: "/placeholder.svg?height=200&width=300",
    chapters: 12,
    lessons: 48,
    duration: "40 giờ",
    students: 1250,
    rating: 4.8,
    instructor: "Nguyễn Văn A",
    price: "Miễn phí",
    featured: true,
  },
  {
    id: 2,
    title: "Thiết kế UI/UX",
    description: "Thiết kế giao diện người dùng chuyên nghiệp với Figma",
    image: "/placeholder.svg?height=200&width=300",
    chapters: 8,
    lessons: 32,
    duration: "25 giờ",
    students: 890,
    rating: 4.9,
    instructor: "Trần Thị B",
    price: "Miễn phí",
    featured: true,
  },
  {
    id: 3,
    title: "Marketing Digital",
    description: "Chiến lược marketing online hiệu quả cho doanh nghiệp",
    image: "/placeholder.svg?height=200&width=300",
    chapters: 10,
    lessons: 40,
    duration: "30 giờ",
    students: 2100,
    rating: 4.7,
    instructor: "Lê Văn C",
    price: "Miễn phí",
    featured: false,
  },
  {
    id: 4,
    title: "Phân tích dữ liệu",
    description: "Học Python, SQL và các công cụ phân tích dữ liệu",
    image: "/placeholder.svg?height=200&width=300",
    chapters: 15,
    lessons: 60,
    duration: "50 giờ",
    students: 750,
    rating: 4.6,
    instructor: "Phạm Thị D",
    price: "Miễn phí",
    featured: false,
  },
]

const instructors = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    title: "Senior Frontend Developer",
    company: "TechCorp Vietnam",
    avatar: "/placeholder-user.jpg",
    courses: 5,
    students: 2500,
    rating: 4.9,
    expertise: ["React", "Vue.js", "TypeScript"],
  },
  {
    id: 2,
    name: "Trần Thị B",
    title: "UI/UX Design Lead",
    company: "Design Studio",
    avatar: "/placeholder-user.jpg",
    courses: 3,
    students: 1800,
    rating: 4.8,
    expertise: ["Figma", "Adobe XD", "Sketch"],
  },
  {
    id: 3,
    name: "Lê Văn C",
    title: "Digital Marketing Manager",
    company: "Marketing Agency",
    avatar: "/placeholder-user.jpg",
    courses: 4,
    students: 3200,
    rating: 4.7,
    expertise: ["SEO", "Google Ads", "Facebook Ads"],
  },
]

const features = [
  {
    icon: <Play className="h-8 w-8 text-blue-600" />,
    title: "Học mọi lúc, mọi nơi",
    description: "Truy cập khóa học 24/7 trên mọi thiết bị, học theo tốc độ của riêng bạn",
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-green-600" />,
    title: "Chứng chỉ được công nhận",
    description: "Nhận chứng chỉ hoàn thành có giá trị và được công nhận bởi các doanh nghiệp",
  },
  {
    icon: <Users className="h-8 w-8 text-purple-600" />,
    title: "Cộng đồng học tập",
    description: "Tham gia cộng đồng học viên, chia sẻ kinh nghiệm và hỗ trợ lẫn nhau",
  },
  {
    icon: <Zap className="h-8 w-8 text-yellow-600" />,
    title: "Cập nhật liên tục",
    description: "Nội dung khóa học được cập nhật thường xuyên theo xu hướng công nghệ mới nhất",
  },
]

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Thị E",
    role: "Sinh viên Đại học",
    avatar: "/placeholder-user.jpg",
    content: "Khóa học Frontend đã giúp tôi có được việc làm ngay sau khi tốt nghiệp. Giảng viên rất tận tâm và nội dung rất thực tế!",
    rating: 5,
  },
  {
    id: 2,
    name: "Trần Văn F",
    role: "Freelancer",
    avatar: "/placeholder-user.jpg",
    content: "Tôi đã học được rất nhiều từ khóa học UI/UX. Bây giờ tôi có thể tự tin nhận các dự án thiết kế.",
    rating: 5,
  },
  {
    id: 3,
    name: "Lê Thị G",
    role: "Marketing Executive",
    avatar: "/placeholder-user.jpg",
    content: "Khóa học Marketing Digital đã giúp tôi thăng tiến trong công việc. Kiến thức rất hữu ích và dễ áp dụng.",
    rating: 4,
  },
]

const stats = [
  { number: "50,000+", label: "Học viên", icon: <Users className="h-6 w-6" /> },
  { number: "200+", label: "Khóa học", icon: <BookOpen className="h-6 w-6" /> },
  { number: "95%", label: "Tỷ lệ hài lòng", icon: <Heart className="h-6 w-6" /> },
  { number: "24/7", label: "Hỗ trợ", icon: <MessageCircle className="h-6 w-6" /> },
]

export default function HomePage() {
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
              Nền tảng học tập hàng đầu Việt Nam
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Học tập trực tuyến
              <span className="text-blue-600"> hiệu quả</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Nâng cao kỹ năng với các khóa học chất lượng cao từ các chuyên gia hàng đầu. Học mọi lúc, mọi nơi với tiến
              độ phù hợp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Đăng nhập để học ngay
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                Khám phá khóa học
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2 text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tại sao chọn EduPlatform?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cung cấp trải nghiệm học tập tốt nhất với những tính năng độc đáo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Khóa học nổi bật</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá các khóa học được yêu thích nhất với nội dung chất lượng cao và phương pháp giảng dạy hiện đại.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {courses.map((course) => (
              <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700">
                        {course.chapters} chương
                      </Badge>
                    </div>
                    {course.featured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Nổi bật
                        </Badge>
                      </div>
                    )}
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
                      <span>{course.lessons} bài</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">{course.price}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Giảng viên: {course.instructor}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={`/course/${course.id}`} className="w-full">
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
              <Button variant="outline" size="lg" className="px-8">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Giảng viên hàng đầu</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Học từ những chuyên gia có kinh nghiệm thực tế trong ngành
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{instructor.name}</h3>
                  <p className="text-sm text-blue-600 mb-1">{instructor.title}</p>
                  <p className="text-xs text-gray-500 mb-3">{instructor.company}</p>
                  
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{instructor.rating}</span>
                  </div>
                  
                  <div className="flex justify-center gap-4 text-xs text-gray-500 mb-4">
                    <span>{instructor.courses} khóa học</span>
                    <span>{instructor.students} học viên</span>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-1">
                    {instructor.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Học viên nói gì?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những phản hồi chân thực từ học viên đã hoàn thành khóa học
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  
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
                      <p className="font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
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
              Sẵn sàng bắt đầu hành trình học tập?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Tham gia cùng hơn 50,000 học viên đã thành công với EduPlatform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                  Đăng ký miễn phí
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
                  Khám phá khóa học
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
                <span className="text-xl font-bold">EduPlatform</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Nền tảng học tập trực tuyến hàng đầu Việt Nam với hàng nghìn khóa học chất lượng cao.
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
                  <Link href="#" className="hover:text-white transition-colors">
                    Lập trình
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Thiết kế
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Marketing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Kinh doanh
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Trung tâm trợ giúp
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
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
            <p>&copy; 2024 EduPlatform. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
