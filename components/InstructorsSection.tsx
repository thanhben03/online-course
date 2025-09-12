'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface Instructor {
  id: number;
  name: string;
  title: string;
  company: string;
  avatar_url: string;
  courses_count: number;
  lessons_count: number;
  rating: number;
  expertise: string[];
  order_index: number;
}

// Dữ liệu mặc định (fallback)
const defaultInstructors = [
  {
    id: 1,
    name: "Nguyễn Hoàng Duy",
    title: "Admin/Founder",
    company: "Olympic Toán Giải Tích",
    avatar_url: "/placeholder-user.jpg",
    courses_count: 7,
    lessons_count: 80,
    rating: 4.8,
    expertise: ["VJIMC", "Olympic Toán Giải Tích", "Manim"],
    order_index: 1
  }
];

export default function InstructorsSection() {
  const [instructors, setInstructors] = useState<Instructor[]>(defaultInstructors);
  const [loading, setLoading] = useState(false);

  // Fetch instructors từ API
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching instructors from API...');
        
        const response = await fetch('/api/instructors');
        console.log('📡 API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📋 API response data:', data);
          
          if (data.instructors && data.instructors.length > 0) {
            console.log('✅ Setting instructors from API:', data.instructors);
            setInstructors(data.instructors);
          } else {
            console.log('⚠️ No instructors from API, using fallback');
          }
        } else {
          console.log('❌ API response not ok:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching instructors:', error);
        // Giữ nguyên dữ liệu mặc định nếu có lỗi
      } finally {
        setLoading(false);
      }
    };

    // Luôn fetch từ API (có thể bật/tắt bằng environment variable sau)
    fetchInstructors();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Người đồng hành
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Đang tải thông tin giảng viên...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
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
                    src={instructor.avatar_url}
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
                    {instructor.courses_count} khóa học
                  </span>
                  <span>
                    {instructor.lessons_count} bài giảng
                  </span>
                </div>

                <div className="flex flex-wrap justify-center gap-1">
                  {instructor.expertise.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs"
                    >
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
  );
}
