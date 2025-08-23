# Hướng dẫn test chức năng cảnh báo F12

## 🚀 Chức năng đã triển khai

✅ **Đếm số lần F12**: Hook `useDevToolsDetector` giờ đây đếm số lần người dùng mở DevTools
✅ **Cảnh báo lần thứ 3**: Gửi cảnh báo đến admin khi người dùng F12 lần thứ 3
✅ **Cảnh báo timeout**: Gửi cảnh báo khi người dùng mở DevTools quá 5 giây (bất kỳ lần nào)
✅ **API endpoint**: `/api/admin/alerts/devtools-warning` để nhận cảnh báo
✅ **Hiển thị trong admin**: Cảnh báo sẽ xuất hiện trong trang admin > Cảnh báo bảo mật
✅ **UI feedback**: Popup hiển thị số lần và thông báo đã gửi cảnh báo

## 🧪 Cách test

### Bước 1: Đăng nhập với tài khoản học viên
```
1. Truy cập /login
2. Đăng nhập với tài khoản bất kỳ (role = 'student')
3. Vào trang học bài (/learn/[id])
```

### Bước 2: Test cảnh báo F12
```
👥 Test cảnh báo theo số lần:
1. Nhấn F12 lần thứ 1 → Popup hiển thị "Lần 1"
2. Đóng DevTools hoàn toàn, nhấn F12 lần thứ 2 → Popup hiển thị "Lần 2"  
3. Đóng DevTools hoàn toàn, nhấn F12 lần thứ 3 → Popup hiển thị "Lần 3" + "🚨 Cảnh báo đã được gửi đến admin!"

⏰ Test cảnh báo timeout (5 giây):
1. Nhấn F12 (bất kỳ lần nào) → Giữ DevTools mở
2. Sau 5 giây → Tự động gửi cảnh báo đến admin
3. Popup hiển thị thêm "(DevTools mở quá 5 giây)"

📝 Lưu ý: 
- Số đếm CHỈ tăng khi ĐÓNG hoàn toàn rồi MỞ LẠI DevTools
- Cảnh báo timeout kích hoạt ngay khi mở DevTools quá 5 giây
```

### Bước 3: Kiểm tra cảnh báo trong admin
```
1. Mở tab mới, truy cập /admin (với tài khoản admin)
2. Chọn "Cảnh báo bảo mật" 
3. Sẽ thấy cảnh báo mới với nội dung:
   "⚠️ CẢNH BÁO DEVTOOLS: Người dùng [Tên] đã mở DevTools 3 lần liên tiếp"
```

## 📋 Thông tin cảnh báo

**Cảnh báo bao gồm:**
- Tên và email người dùng
- Số lần F12 
- Lý do cảnh báo (count = số lần, timeout = mở quá 5s)
- Trang hiện tại (URL)
- IP address
- User agent
- Thời gian
- Mức độ nghiêm trọng (HIGH khi >= 3 lần hoặc timeout)

## ⚙️ Cấu hình

**Logic đếm:** Chỉ đếm khi chuyển từ "đóng" sang "mở" DevTools (không đếm liên tục)
**Ngưỡng cảnh báo:** 3 lần F12 HOẶC mở DevTools quá 5 giây
**Chống spam:** Chỉ gửi 1 cảnh báo/giờ cho mỗi user về DevTools

## 🔧 Troubleshooting

**Nếu không thấy cảnh báo:**
1. Kiểm tra console browser có lỗi không
2. Kiểm tra user đã đăng nhập và có trong localStorage
3. Kiểm tra database có bảng `admin_alerts` chưa
4. Kiểm tra network tab có gọi API `/api/admin/alerts/devtools-warning` không

**Reset counter:** Reload trang để reset số đếm về 0

## 📝 Logs

Khi gửi cảnh báo thành công, sẽ có log trong console:
```
🚨 DEVTOOLS WARNING: User [Name] ([Email]) - 3 times - IP: [IP]
🚨 Cảnh báo DevTools đã được gửi đến admin (lần 3)
```
