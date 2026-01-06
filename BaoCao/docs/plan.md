# Cải tiến Trang Quản lý Sản phẩm (Admin Products)

## Phân tích hiện trạng

### Vấn đề 1: Không phân theo danh mục

- Hiện tại hiển thị **tất cả sản phẩm** trong 1 bảng phẳng
- Không có bộ lọc theo danh mục/danh mục con
- Khó quản lý khi số lượng sản phẩm tăng

### Vấn đề 2: Lỗi upload ảnh Cloudinary

- Code đang dùng `VITE_CLOUDINARY_CLOUD_NAME` và `VITE_CLOUDINARY_UPLOAD_PRESET`
- Các biến này **chưa được định nghĩa** trong frontend (chỉ có trong backend `.env`)
- Kết quả: Upload thất bại, dùng `URL.createObjectURL()` (ảnh tạm, mất sau khi refresh)

---

## Đề xuất cải tiến

### A. Danh sách sản phẩm (`AdminProducts.tsx`)

1. **Thêm bộ lọc danh mục**:

   - Dropdown chọn danh mục cha
   - Dropdown chọn danh mục con (sau khi chọn cha)
   - Tabs nhanh: "Tất cả" | "Máy lạnh" | "Tủ lạnh" | ...

2. **Hiển thị cột danh mục**: Thêm cột hiển thị tên danh mục sản phẩm thuộc về

3. **Thêm cột "Nổi bật"**: Hiển thị sản phẩm nào đang được đánh dấu is_featured

### B. Form thêm/sửa sản phẩm (`ProductEditor.tsx`)

1. **Sửa Cloudinary upload**:

   - Hardcode config hoặc tạo file `.env` frontend
   - Dùng preset `dienlanh_upload` đã tạo

2. **Hiển thị danh mục dạng tree**:
   - Thay dropdown phẳng bằng grouped options (Cha → Con)

### C. Cải tiến khác (Optional)

1. **Pagination**: Phân trang khi có nhiều sản phẩm (>50)
2. **Bulk actions**: Chọn nhiều sản phẩm → Ẩn/Xóa cùng lúc
3. **Sắp xếp**: Sort theo giá, tên, ngày tạo
4. **Export**: Xuất danh sách sản phẩm ra Excel/CSV

---

## Kế hoạch thực hiện

### Bước 1: Fix Cloudinary Upload (Ưu tiên cao)

- Thêm config Cloudinary vào `ProductEditor.tsx` (hardcode như AdminCategories)
- Hoặc tạo file `.env` cho frontend với biến `VITE_CLOUDINARY_*`

### Bước 2: Thêm Category Filter cho AdminProducts

- Fetch danh sách categories (tree)
- Thêm dropdown filter
- Filter products theo category_id

### Bước 3: Cải tiến UI

- Hiển thị danh mục trong bảng
- Thêm badge "Nổi bật" cho is_featured

---

## Câu hỏi xác nhận

Bạn muốn mình:

1. **Fix Cloudinary trước** (quan trọng nhất) rồi tiếp tục?
2. Thực hiện **tất cả** các cải tiến trên?
3. Có muốn thêm **pagination** và **bulk actions** không?
