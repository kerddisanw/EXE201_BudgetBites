-- Migration script: thêm các cột mới cho bảng menu_items
-- Chạy trực tiếp trên PostgreSQL nếu không muốn restart backend

-- Thêm cột day_of_week (MONDAY, TUESDAY, ...)
ALTER TABLE menu_items
    ADD COLUMN IF NOT EXISTS day_of_week VARCHAR(20);

-- Thêm cột image_url (ảnh món ăn)
ALTER TABLE menu_items
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Thêm cột with_tray cho cart_items (nếu bảng đã tồn tại)
ALTER TABLE cart_items
    ADD COLUMN IF NOT EXISTS with_tray BOOLEAN NOT NULL DEFAULT FALSE;

-- Tạo bảng cart_items nếu chưa tồn tại (Hibernate chưa tạo)
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    menu_item_id BIGINT NOT NULL REFERENCES menu_items(id),
    order_date DATE NOT NULL,
    with_tray BOOLEAN NOT NULL DEFAULT FALSE,
    added_at TIMESTAMP DEFAULT NOW()
);

-- Thêm cột menu_item_id vào meal_orders nếu chưa có
ALTER TABLE meal_orders
    ADD COLUMN IF NOT EXISTS menu_item_id BIGINT REFERENCES menu_items(id);

-- Xác nhận thay đổi
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('menu_items', 'cart_items', 'meal_orders')
ORDER BY table_name, column_name;
