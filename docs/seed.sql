-- ============================================
-- DATABASE SEED: Website Bán Điện Lạnh
-- Version: 1.0
-- Usage: mysql -u root dienlanh_shop < docs/seed.sql
-- ============================================

-- Xóa data cũ (theo thứ tự FK)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE chat_messages;
TRUNCATE TABLE chat_conversations;
TRUNCATE TABLE payment_transactions;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE reviews;
TRUNCATE TABLE product_images;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE customers;
TRUNCATE TABLE admins;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. ADMINS
-- Password: admin123 (bcrypt hash)
-- ============================================
INSERT INTO admins (username, email, password, full_name, is_active) VALUES
('admin', 'admin@dienlanh.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.4qtpZR/UNHIzuy', 'Administrator', TRUE),
('manager', 'manager@dienlanh.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.4qtpZR/UNHIzuy', 'Nguyễn Văn Quản Lý', TRUE);

-- ============================================
-- 2. CUSTOMERS
-- Password: password123 (bcrypt hash)
-- ============================================
INSERT INTO customers (email, password, full_name, phone, address, is_active) VALUES
('customer1@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.4qtpZR/UNHIzuy', 'Nguyễn Văn An', '0901234567', '123 Nguyễn Huệ, Q.1, TP.HCM', TRUE),
('customer2@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.4qtpZR/UNHIzuy', 'Trần Thị Bình', '0912345678', '456 Lê Lợi, Q.3, TP.HCM', TRUE),
('customer3@gmail.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.4qtpZR/UNHIzuy', 'Lê Văn Cường', '0923456789', '789 Hai Bà Trưng, Q.Bình Thạnh, TP.HCM', TRUE);

-- ============================================
-- 3. CATEGORIES (Danh mục điện lạnh)
-- ============================================
INSERT INTO categories (id, parent_id, name, slug, description, sort_order, is_active) VALUES
-- Danh mục cha
(1, NULL, 'Máy lạnh', 'may-lanh', 'Điều hòa không khí các loại', 1, TRUE),
(2, NULL, 'Tủ lạnh', 'tu-lanh', 'Tủ lạnh gia đình và công nghiệp', 2, TRUE),
(3, NULL, 'Máy giặt', 'may-giat', 'Máy giặt và máy sấy quần áo', 3, TRUE),
(4, NULL, 'Quạt điện', 'quat-dien', 'Quạt điện các loại', 4, TRUE),
-- Danh mục con - Máy lạnh
(5, 1, 'Máy lạnh treo tường', 'may-lanh-treo-tuong', 'Điều hòa treo tường phổ biến', 1, TRUE),
(6, 1, 'Máy lạnh âm trần', 'may-lanh-am-tran', 'Điều hòa âm trần cho văn phòng', 2, TRUE),
(7, 1, 'Máy lạnh tủ đứng', 'may-lanh-tu-dung', 'Điều hòa tủ đứng công suất lớn', 3, TRUE),
-- Danh mục con - Tủ lạnh
(8, 2, 'Tủ lạnh mini', 'tu-lanh-mini', 'Tủ lạnh nhỏ gọn', 1, TRUE),
(9, 2, 'Tủ lạnh 2 cánh', 'tu-lanh-2-canh', 'Tủ lạnh 2 cửa phổ biến', 2, TRUE),
(10, 2, 'Tủ lạnh Side by Side', 'tu-lanh-side-by-side', 'Tủ lạnh cao cấp', 3, TRUE);

-- ============================================
-- 4. PRODUCTS (Sản phẩm điện lạnh)
-- ============================================
INSERT INTO products (id, category_id, name, slug, short_description, description, original_price, sale_price, stock_quantity, brand, specifications, is_featured, is_active, view_count) VALUES
-- Máy lạnh treo tường
(1, 5, 'Máy lạnh Daikin Inverter 1HP FTKZ25VVMV', 'may-lanh-daikin-1hp-ftkz25', 'Tiết kiệm điện, làm lạnh nhanh, kháng khuẩn', 'Máy lạnh Daikin Inverter 1HP với công nghệ làm lạnh nhanh, tiết kiệm điện năng tối đa. Trang bị bộ lọc kháng khuẩn, khử mùi hiệu quả.', 12500000, 11500000, 15, 'Daikin', '{"công_suất": "1HP", "loại": "Inverter", "diện_tích": "15m²", "gas": "R32"}', TRUE, TRUE, 150),
(2, 5, 'Máy lạnh Panasonic Inverter 1.5HP CU/CS-XU12XKH-8', 'may-lanh-panasonic-1.5hp', 'Công nghệ Nanoe-X khử khuẩn 99.9%', 'Máy lạnh Panasonic 1.5HP với công nghệ Nanoe-X diệt khuẩn, khử mùi. Chế độ làm lạnh nhanh iAuto-X.', 15000000, 13500000, 12, 'Panasonic', '{"công_suất": "1.5HP", "loại": "Inverter", "diện_tích": "18m²", "gas": "R32"}', TRUE, TRUE, 120),
(3, 5, 'Máy lạnh LG Inverter 1HP V10ENW1', 'may-lanh-lg-1hp', 'Dual Cool Inverter tiết kiệm 70% điện', 'Máy lạnh LG 1HP với công nghệ Dual Cool Inverter tiết kiệm điện năng. Thiết kế hiện đại, vận hành êm ái.', 9500000, 8500000, 20, 'LG', '{"công_suất": "1HP", "loại": "Inverter", "diện_tích": "15m²", "gas": "R32"}', FALSE, TRUE, 80),
(4, 6, 'Máy lạnh âm trần Daikin 2HP FCF50CVM', 'may-lanh-am-tran-daikin-2hp', 'Thiết kế gọn, phù hợp văn phòng', 'Máy lạnh âm trần Daikin 2HP với thiết kế compact, phân phối gió đều 4 hướng. Phù hợp văn phòng, showroom.', 28000000, 26000000, 8, 'Daikin', '{"công_suất": "2HP", "loại": "Cassette", "diện_tích": "30m²", "gas": "R410A"}', TRUE, TRUE, 45),

-- Tủ lạnh
(5, 9, 'Tủ lạnh Samsung Inverter 300L RT29K5532BY', 'tu-lanh-samsung-300l', 'Công nghệ Digital Inverter bền bỉ', 'Tủ lạnh Samsung 300L với công nghệ Digital Inverter tiết kiệm điện, bảo hành 10 năm máy nén. Ngăn đông mềm -1°C.', 8500000, 7900000, 10, 'Samsung', '{"dung_tích": "300L", "loại": "2 cánh", "công_nghệ": "Digital Inverter"}', TRUE, TRUE, 200),
(6, 9, 'Tủ lạnh LG Inverter 335L GN-M332PS', 'tu-lanh-lg-335l', 'Linear Cooling làm lạnh đều', 'Tủ lạnh LG 335L với công nghệ Linear Cooling giữ thực phẩm tươi lâu hơn. Khay đá xoay tiện lợi.', 9200000, 8500000, 8, 'LG', '{"dung_tích": "335L", "loại": "2 cánh", "công_nghệ": "Linear Inverter"}', FALSE, TRUE, 95),
(7, 10, 'Tủ lạnh Samsung Side by Side 680L RS64R5301B4', 'tu-lanh-samsung-680l-side-by-side', 'Tủ lạnh cao cấp, làm đá tự động', 'Tủ lạnh Samsung Side by Side 680L với thiết kế sang trọng, làm đá tự động, ngăn chuyển đổi linh hoạt.', 28000000, 25500000, 5, 'Samsung', '{"dung_tích": "680L", "loại": "Side by Side", "công_nghệ": "SpaceMax"}', TRUE, TRUE, 60),
(8, 8, 'Tủ lạnh mini Aqua 90L AQR-D99FA', 'tu-lanh-mini-aqua-90l', 'Nhỏ gọn, phù hợp phòng trọ', 'Tủ lạnh mini Aqua 90L với thiết kế nhỏ gọn, tiết kiệm không gian. Phù hợp phòng trọ, ký túc xá.', 2800000, 2500000, 25, 'Aqua', '{"dung_tích": "90L", "loại": "Mini", "công_nghệ": "Direct Cool"}', FALSE, TRUE, 180),

-- Máy giặt
(9, 3, 'Máy giặt LG Inverter 9kg FV1409S4W', 'may-giat-lg-9kg', 'AI DD nhận diện vải thông minh', 'Máy giặt LG 9kg với công nghệ AI DD nhận diện loại vải, bảo vệ quần áo. Giặt hơi nước diệt khuẩn 99.9%.', 8500000, 7800000, 12, 'LG', '{"khối_lượng": "9kg", "loại": "Cửa trước", "công_nghệ": "AI DD"}', TRUE, TRUE, 130),
(10, 3, 'Máy giặt Samsung Inverter 10kg WW10T634DLX', 'may-giat-samsung-10kg', 'Giặt bong bóng siêu sạch', 'Máy giặt Samsung 10kg với công nghệ EcoBubble giặt sạch sâu ở nhiệt độ thấp. Digital Inverter tiết kiệm điện.', 9800000, 9000000, 10, 'Samsung', '{"khối_lượng": "10kg", "loại": "Cửa trước", "công_nghệ": "EcoBubble"}', FALSE, TRUE, 85),

-- Quạt điện
(11, 4, 'Quạt trần Panasonic F-60WWK', 'quat-tran-panasonic-f60wwk', 'Quạt trần 5 cánh, gió mạnh', 'Quạt trần Panasonic 5 cánh, sải cánh 1.5m, gió mạnh mát. Motor bền bỉ, tiết kiệm điện.', 2200000, 1950000, 30, 'Panasonic', '{"loại": "Quạt trần", "sải_cánh": "1.5m", "số_cánh": 5}', FALSE, TRUE, 75),
(12, 4, 'Quạt đứng Senko DH1600', 'quat-dung-senko-dh1600', 'Quạt đứng công nghiệp 3 cánh', 'Quạt đứng Senko công nghiệp với 3 tốc độ gió, cánh nhựa bền. Phù hợp nhà xưởng, cửa hàng.', 850000, 750000, 50, 'Senko', '{"loại": "Quạt đứng", "công_suất": "55W", "số_cánh": 3}', FALSE, TRUE, 220);

-- ============================================
-- 5. PRODUCT_IMAGES
-- ============================================
INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
-- Máy lạnh Daikin 1HP
(1, 'https://placehold.co/600x400/0066cc/white?text=Daikin+1HP', 1, TRUE),
(1, 'https://placehold.co/600x400/0066cc/white?text=Daikin+1HP+Side', 2, FALSE),
-- Máy lạnh Panasonic
(2, 'https://placehold.co/600x400/003366/white?text=Panasonic+1.5HP', 1, TRUE),
-- Máy lạnh LG
(3, 'https://placehold.co/600x400/cc0033/white?text=LG+1HP', 1, TRUE),
-- Máy lạnh âm trần
(4, 'https://placehold.co/600x400/0066cc/white?text=Daikin+Cassette', 1, TRUE),
-- Tủ lạnh Samsung 300L
(5, 'https://placehold.co/600x400/1428a0/white?text=Samsung+300L', 1, TRUE),
-- Tủ lạnh LG
(6, 'https://placehold.co/600x400/cc0033/white?text=LG+335L', 1, TRUE),
-- Tủ lạnh Side by Side
(7, 'https://placehold.co/600x400/1428a0/white?text=Samsung+SBS', 1, TRUE),
-- Tủ lạnh mini
(8, 'https://placehold.co/600x400/00aa66/white?text=Aqua+Mini', 1, TRUE),
-- Máy giặt LG
(9, 'https://placehold.co/600x400/cc0033/white?text=LG+9kg', 1, TRUE),
-- Máy giặt Samsung
(10, 'https://placehold.co/600x400/1428a0/white?text=Samsung+10kg', 1, TRUE),
-- Quạt trần
(11, 'https://placehold.co/600x400/003366/white?text=Panasonic+Fan', 1, TRUE),
-- Quạt đứng
(12, 'https://placehold.co/600x400/666666/white?text=Senko+Fan', 1, TRUE);

-- ============================================
-- 6. CARTS (Giỏ hàng của customers)
-- ============================================
INSERT INTO carts (customer_id) VALUES
(1), (2), (3);

-- ============================================
-- 7. CART_ITEMS
-- ============================================
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
(1, 1, 1),  -- Customer 1: Máy lạnh Daikin
(1, 5, 1),  -- Customer 1: Tủ lạnh Samsung
(2, 9, 2);  -- Customer 2: 2 máy giặt LG

-- ============================================
-- 8. ORDERS
-- ============================================
INSERT INTO orders (id, customer_id, order_code, subtotal, shipping_fee, total_amount, status, payment_method, payment_status, shipping_name, shipping_phone, shipping_address, note, paid_at) VALUES
(1, 1, 'ORD20260101001', 11500000, 0, 11500000, 'delivered', 'cod', 'paid', 'Nguyễn Văn An', '0901234567', '123 Nguyễn Huệ, Q.1, TP.HCM', 'Giao giờ hành chính', '2026-01-01 14:30:00'),
(2, 2, 'ORD20260102001', 13500000, 50000, 13550000, 'shipping', 'online', 'paid', 'Trần Thị Bình', '0912345678', '456 Lê Lợi, Q.3, TP.HCM', NULL, '2026-01-02 10:15:00'),
(3, 1, 'ORD20260103001', 7900000, 0, 7900000, 'confirmed', 'cod', 'pending', 'Nguyễn Văn An', '0901234567', '123 Nguyễn Huệ, Q.1, TP.HCM', 'Gọi trước khi giao', NULL),
(4, 3, 'ORD20260103002', 25500000, 0, 25500000, 'pending', 'online', 'pending', 'Lê Văn Cường', '0923456789', '789 Hai Bà Trưng, Q.Bình Thạnh, TP.HCM', NULL, NULL);

-- ============================================
-- 9. ORDER_ITEMS
-- ============================================
INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price) VALUES
-- Order 1: Máy lạnh Daikin
(1, 1, 'Máy lạnh Daikin Inverter 1HP FTKZ25VVMV', 'https://placehold.co/600x400/0066cc/white?text=Daikin+1HP', 1, 11500000, 11500000),
-- Order 2: Máy lạnh Panasonic
(2, 2, 'Máy lạnh Panasonic Inverter 1.5HP CU/CS-XU12XKH-8', 'https://placehold.co/600x400/003366/white?text=Panasonic+1.5HP', 1, 13500000, 13500000),
-- Order 3: Tủ lạnh Samsung
(3, 5, 'Tủ lạnh Samsung Inverter 300L RT29K5532BY', 'https://placehold.co/600x400/1428a0/white?text=Samsung+300L', 1, 7900000, 7900000),
-- Order 4: Tủ lạnh Side by Side
(4, 7, 'Tủ lạnh Samsung Side by Side 680L RS64R5301B4', 'https://placehold.co/600x400/1428a0/white?text=Samsung+SBS', 1, 25500000, 25500000);

-- ============================================
-- 10. PAYMENT_TRANSACTIONS
-- ============================================
INSERT INTO payment_transactions (order_id, request_id, transaction_id, provider, amount, status, signature_valid, provider_response) VALUES
(2, 'REQ_ORD20260102001_1704182100', 'TXN_SEPAY_123456', 'mock', 13550000, 'success', TRUE, '{"code": "00", "message": "Success"}'),
(4, 'REQ_ORD20260103002_1704268800', NULL, 'mock', 25500000, 'pending', NULL, NULL);

-- ============================================
-- 11. REVIEWS
-- ============================================
INSERT INTO reviews (customer_id, product_id, rating, comment, is_approved) VALUES
(1, 1, 5, 'Máy lạnh chạy rất êm, làm lạnh nhanh. Rất hài lòng!', TRUE),
(1, 5, 4, 'Tủ lạnh đẹp, tiết kiệm điện. Giao hàng nhanh.', TRUE),
(2, 2, 5, 'Panasonic chất lượng tốt, công nghệ Nanoe-X rất hay.', TRUE),
(2, 9, 4, 'Máy giặt LG giặt sạch, vắt khô tốt. Hơi ồn một chút.', FALSE);

-- ============================================
-- 12. CHAT_CONVERSATIONS
-- ============================================
INSERT INTO chat_conversations (customer_id, session_id, title) VALUES
(1, 'sess_abc123', 'Hỏi về máy lạnh Daikin'),
(2, 'sess_def456', 'Tư vấn tủ lạnh phù hợp'),
(NULL, 'sess_guest_789', 'Khách vãng lai hỏi giá');

-- ============================================
-- 13. CHAT_MESSAGES
-- ============================================
INSERT INTO chat_messages (conversation_id, sender_type, content) VALUES
(1, 'customer', 'Cho mình hỏi máy lạnh Daikin 1HP giá bao nhiêu?'),
(1, 'bot', 'Dạ, máy lạnh Daikin Inverter 1HP FTKZ25VVMV hiện đang có giá khuyến mãi 11.500.000đ (giá gốc 12.500.000đ). Sản phẩm này có công suất phù hợp phòng 15m², tiết kiệm điện và kháng khuẩn. Anh/chị cần thêm thông tin gì không ạ?'),
(1, 'customer', 'Bảo hành bao lâu vậy?'),
(1, 'bot', 'Dạ, máy lạnh Daikin được bảo hành chính hãng 1 năm máy và 5 năm máy nén ạ. Ngoài ra shop còn hỗ trợ lắp đặt miễn phí trong nội thành TP.HCM.'),
(2, 'customer', 'Tủ lạnh nào phù hợp cho gia đình 4 người?'),
(2, 'bot', 'Dạ, với gia đình 4 người, em gợi ý anh/chị tham khảo tủ lạnh Samsung 300L hoặc LG 335L. Cả 2 đều là hàng inverter tiết kiệm điện, giá dao động từ 7.9 đến 8.5 triệu. Anh/chị thích hãng nào hơn ạ?');

-- ============================================
-- HOÀN TẤT SEED DATA
-- ============================================
-- Tổng: 2 admins, 3 customers, 10 categories, 12 products
-- 12 product_images, 3 carts, 3 cart_items
-- 4 orders, 4 order_items, 2 payment_transactions
-- 4 reviews, 3 conversations, 6 messages
-- ============================================
