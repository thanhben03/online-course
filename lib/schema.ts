import sql from './db';

// Tạo bảng users
export const createUsersTable = sql`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    school VARCHAR(255),
    city VARCHAR(100),
    grade VARCHAR(50),
    avatar_url VARCHAR(500),
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Tạo bảng courses
export const createCoursesTable = sql`
  CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    price DECIMAL(10,2) DEFAULT 0.00,
    instructor_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Tạo bảng lessons
export const createLessonsTable = sql`
  CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    duration INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Tạo bảng enrollments
export const createEnrollmentsTable = sql`
  CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress INTEGER DEFAULT 0,
    UNIQUE(user_id, course_id)
  );
`;

// Tạo bảng progress
export const createProgressTable = sql`
  CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    watched_duration INTEGER DEFAULT 0,
    last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
  );
`;

// Tạo bảng uploads
export const createUploadsTable = sql`
  CREATE TABLE IF NOT EXISTS uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    lesson_id INTEGER REFERENCES lessons(id),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    s3_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'uploading',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Tạo bảng login_sessions (để theo dõi IP đăng nhập)
export const createLoginSessionsTable = sql`
  CREATE TABLE IF NOT EXISTS login_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Tạo index cho bảng login_sessions
export const createLoginSessionsUserIdIndex = sql`
  CREATE INDEX IF NOT EXISTS idx_login_sessions_user_id ON login_sessions(user_id);
`;

export const createLoginSessionsLoginAtIndex = sql`
  CREATE INDEX IF NOT EXISTS idx_login_sessions_login_at ON login_sessions(login_at);
`;

// Tạo bảng admin_alerts (để lưu cảnh báo gửi cho admin)
export const createAdminAlertsTable = sql`
  CREATE TABLE IF NOT EXISTS admin_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Tạo bảng site_settings (để lưu cài đặt chung của trang web)
export const createSiteSettingsTable = sql`
  CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Tạo index cho bảng admin_alerts
export const createAdminAlertsCreatedAtIndex = sql`
  CREATE INDEX IF NOT EXISTS idx_admin_alerts_created_at ON admin_alerts(created_at);
`;

export const createAdminAlertsIsReadIndex = sql`
  CREATE INDEX IF NOT EXISTS idx_admin_alerts_is_read ON admin_alerts(is_read);
`;

export const createAdminAlertsUserIdIndex = sql`
  CREATE INDEX IF NOT EXISTS idx_admin_alerts_user_id ON admin_alerts(user_id);
`;

// Hàm khởi tạo tất cả bảng
export const initializeDatabase = async () => {
  try {
    await createUsersTable;
    await createCoursesTable;
    await createLessonsTable;
    await createEnrollmentsTable;
    await createProgressTable;
    await createUploadsTable;
    await createLoginSessionsTable;
    await createLoginSessionsUserIdIndex;
    await createLoginSessionsLoginAtIndex;
    await createAdminAlertsTable;
    await createSiteSettingsTable;
    await createAdminAlertsCreatedAtIndex;
    await createAdminAlertsIsReadIndex;
    await createAdminAlertsUserIdIndex;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Tạo bảng instructors (để quản lý thông tin giảng viên trên trang chủ)
export const createInstructorsTable = sql`
  CREATE TABLE IF NOT EXISTS instructors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) DEFAULT '/placeholder-user.jpg',
    courses_count INTEGER DEFAULT 0,
    lessons_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 5.00,
    expertise TEXT[], -- Array of skills
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Thêm dữ liệu mẫu cho instructors
export const seedInstructorsData = sql`
  INSERT INTO instructors (name, title, company, avatar_url, courses_count, lessons_count, rating, expertise, order_index) 
  VALUES 
    ('Nguyễn Hoàng Duy', 'Admin/Founder', 'Olympic Toán Giải Tích', '/placeholder-user.jpg', 7, 80, 4.8, ARRAY['VJIMC', 'Olympic Toán Giải Tích', 'Manim'], 1)
  ON CONFLICT (id) DO NOTHING;
`; 