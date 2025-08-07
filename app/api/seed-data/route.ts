import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST() {
  try {
    // Tạo dữ liệu mẫu cho courses
    const sampleCourses = [
      {
        title: "Lập trình Web Frontend",
        description: "Học HTML, CSS, JavaScript và React từ cơ bản đến nâng cao. Khóa học này sẽ giúp bạn trở thành một Frontend Developer chuyên nghiệp.",
        thumbnail_url: "/placeholder.svg",
        price: 500000,
        instructor_id: 1,
        status: "published"
      },
      {
        title: "Thiết kế UI/UX",
        description: "Thiết kế giao diện người dùng chuyên nghiệp với Figma. Học cách tạo wireframes, prototypes và design systems.",
        thumbnail_url: "/placeholder.svg",
        price: 400000,
        instructor_id: 1,
        status: "published"
      },
      {
        title: "Marketing Digital",
        description: "Chiến lược marketing online hiệu quả cho doanh nghiệp. Bao gồm SEO, Google Ads, Facebook Ads và Content Marketing.",
        thumbnail_url: "/placeholder.svg",
        price: 600000,
        instructor_id: 1,
        status: "published"
      },
      {
        title: "Lập trình Backend với Node.js",
        description: "Xây dựng API và ứng dụng backend với Node.js, Express và MongoDB. Học về authentication, database design và deployment.",
        thumbnail_url: "/placeholder.svg",
        price: 700000,
        instructor_id: 1,
        status: "published"
      },
      {
        title: "Data Science cơ bản",
        description: "Giới thiệu về Data Science với Python. Học về data analysis, machine learning và visualization.",
        thumbnail_url: "/placeholder.svg",
        price: 800000,
        instructor_id: 1,
        status: "draft"
      }
    ];

    // Insert courses
    const courseIds = [];
    for (const course of sampleCourses) {
      const result = await sql`
        INSERT INTO courses (title, description, thumbnail_url, price, instructor_id, status)
        VALUES (${course.title}, ${course.description}, ${course.thumbnail_url}, ${course.price}, ${course.instructor_id}, ${course.status})
        RETURNING id
      `;
      courseIds.push(result[0].id);
    }

    // Tạo dữ liệu mẫu cho lessons
    const sampleLessons = [
      // Course 1: Lập trình Web Frontend
      {
        course_id: courseIds[0],
        title: "Giới thiệu về HTML",
        description: "Tìm hiểu cấu trúc cơ bản của HTML và các thẻ quan trọng",
        video_url: "https://example.com/video1.mp4",
        duration: 1800, // 30 phút
        order_index: 1
      },
      {
        course_id: courseIds[0],
        title: "CSS cơ bản",
        description: "Học cách styling với CSS, selectors và properties",
        video_url: "https://example.com/video2.mp4",
        duration: 2400, // 40 phút
        order_index: 2
      },
      {
        course_id: courseIds[0],
        title: "JavaScript Fundamentals",
        description: "Làm quen với JavaScript, variables, functions và DOM manipulation",
        video_url: "https://example.com/video3.mp4",
        duration: 3600, // 60 phút
        order_index: 3
      },
      {
        course_id: courseIds[0],
        title: "React Basics",
        description: "Giới thiệu về React, components và JSX",
        video_url: "https://example.com/video4.mp4",
        duration: 4200, // 70 phút
        order_index: 4
      },

      // Course 2: Thiết kế UI/UX
      {
        course_id: courseIds[1],
        title: "Nguyên lý thiết kế",
        description: "Tìm hiểu các nguyên lý cơ bản của thiết kế UI/UX",
        video_url: "https://example.com/video5.mp4",
        duration: 1800,
        order_index: 1
      },
      {
        course_id: courseIds[1],
        title: "Wireframing với Figma",
        description: "Học cách tạo wireframes và prototypes trong Figma",
        video_url: "https://example.com/video6.mp4",
        duration: 3000,
        order_index: 2
      },
      {
        course_id: courseIds[1],
        title: "Design Systems",
        description: "Xây dựng design system và component library",
        video_url: "https://example.com/video7.mp4",
        duration: 3600,
        order_index: 3
      },

      // Course 3: Marketing Digital
      {
        course_id: courseIds[2],
        title: "Tổng quan về Digital Marketing",
        description: "Giới thiệu về các kênh marketing online",
        video_url: "https://example.com/video8.mp4",
        duration: 1800,
        order_index: 1
      },
      {
        course_id: courseIds[2],
        title: "SEO cơ bản",
        description: "Tối ưu hóa website cho công cụ tìm kiếm",
        video_url: "https://example.com/video9.mp4",
        duration: 2400,
        order_index: 2
      },
      {
        course_id: courseIds[2],
        title: "Google Ads",
        description: "Quảng cáo Google Ads và Google Shopping",
        video_url: "https://example.com/video10.mp4",
        duration: 3000,
        order_index: 3
      },

      // Course 4: Backend với Node.js
      {
        course_id: courseIds[3],
        title: "Giới thiệu Node.js",
        description: "Tìm hiểu về Node.js và môi trường runtime",
        video_url: "https://example.com/video11.mp4",
        duration: 1800,
        order_index: 1
      },
      {
        course_id: courseIds[3],
        title: "Express.js Framework",
        description: "Xây dựng REST API với Express.js",
        video_url: "https://example.com/video12.mp4",
        duration: 3600,
        order_index: 2
      },
      {
        course_id: courseIds[3],
        title: "Database với MongoDB",
        description: "Làm việc với MongoDB và Mongoose ODM",
        video_url: "https://example.com/video13.mp4",
        duration: 4200,
        order_index: 3
      },
      {
        course_id: courseIds[3],
        title: "Authentication & Authorization",
        description: "Implement JWT authentication và role-based access control",
        video_url: "https://example.com/video14.mp4",
        duration: 3600,
        order_index: 4
      }
    ];

    // Insert lessons
    for (const lesson of sampleLessons) {
      await sql`
        INSERT INTO lessons (course_id, title, description, video_url, duration, order_index)
        VALUES (${lesson.course_id}, ${lesson.title}, ${lesson.description}, ${lesson.video_url}, ${lesson.duration}, ${lesson.order_index})
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Dữ liệu mẫu đã được tạo thành công',
      data: {
        coursesCreated: sampleCourses.length,
        lessonsCreated: sampleLessons.length,
        courseIds: courseIds
      }
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi khi tạo dữ liệu mẫu'
      },
      { status: 500 }
    );
  }
} 