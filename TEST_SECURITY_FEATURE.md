# Hướng dẫn test tính năng cảnh báo bảo mật

## Tính năng đã triển khai

✅ **Theo dõi IP đăng nhập**: Hệ thống sẽ ghi lại tất cả IP address khi user đăng nhập
✅ **Cảnh báo đa IP**: Tự động tạo cảnh báo khi user đăng nhập từ 3 IP khác nhau trong 30 ngày
✅ **Dashboard admin**: Giao diện để admin xem và quản lý cảnh báo
✅ **API đầy đủ**: Các endpoint để quản lý cảnh báo và thông tin bảo mật

## Cách test

### Bước 1: Tạo bảng database
```bash
# Cách 1: Qua API endpoint
curl -X POST http://localhost:3000/api/admin/migrate-security

# Cách 2: Chạy script trực tiếp  
npx ts-node scripts/add-security-tables.ts
```

**Lưu ý**: Đã sửa lỗi INDEX syntax cho PostgreSQL/Neon. Các index bây giờ được tạo riêng biệt.

### Bước 2: Test cảnh báo đa IP

1. **Đăng nhập từ nhiều IP khác nhau**:
   - Sử dụng VPN để thay đổi IP
   - Hoặc sử dụng các proxy khác nhau
   - Hoặc đăng nhập từ các mạng khác nhau (wifi, 4G, etc.)

2. **Mô phỏng nhiều IP** (cho test):
   - Modify header `X-Forwarded-For` trong request
   - Sử dụng các tool như Postman hoặc curl với header tùy chỉnh

### Bước 3: Kiểm tra cảnh báo

1. **Truy cập admin panel**: `http://localhost:3000/admin`
2. **Chọn tab "Cảnh báo bảo mật"**
3. **Xem cảnh báo chưa đọc và tất cả cảnh báo**

### Bước 4: Test API endpoints

```bash
# Lấy cảnh báo chưa đọc
curl http://localhost:3000/api/admin/alerts

# Lấy tất cả cảnh báo
curl http://localhost:3000/api/admin/alerts?all=true

# Đánh dấu cảnh báo đã đọc
curl -X PUT http://localhost:3000/api/admin/alerts \
  -H "Content-Type: application/json" \
  -d '{"alertId": 1}'

# Xem thông tin bảo mật của user
curl http://localhost:3000/api/admin/users/1/security
```

## Cấu trúc dữ liệu

### Bảng login_sessions
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER (references users.id)
- ip_address: VARCHAR(45) -- Hỗ trợ cả IPv4 và IPv6
- user_agent: TEXT
- login_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Bảng admin_alerts
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER (references users.id)
- alert_type: VARCHAR(100) -- 'multiple_ip_login'
- message: TEXT -- Thông báo cho admin
- details: JSONB -- Chi tiết cảnh báo (IP list, thống kê)
- is_read: BOOLEAN DEFAULT FALSE
- created_at: TIMESTAMP
```

## Thông tin cảnh báo

Khi user đăng nhập từ 3 IP khác nhau trở lên trong 30 ngày, hệ thống sẽ:

1. **Tạo cảnh báo tự động** với thông tin:
   - Tên và email user
   - Số lượng IP khác nhau
   - Danh sách các IP đã sử dụng
   - IP hiện tại đang đăng nhập
   - Timestamp

2. **Giới hạn spam**: Chỉ tạo 1 cảnh báo trong 24h cho mỗi user

3. **Lưu trữ chi tiết**: Toàn bộ thông tin trong trường `details` dạng JSON

## Tùy chỉnh

Có thể điều chỉnh các thông số trong `loginSecurityService.ts`:
- **Ngưỡng IP**: Hiện tại là 3 IP (thay đổi trong `checkAndCreateMultipleIPAlert`)
- **Khoảng thời gian**: Hiện tại là 30 ngày
- **Giới hạn cảnh báo**: Hiện tại là 24h/cảnh báo
