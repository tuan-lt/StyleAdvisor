# 🧩 Style Advisor - Chrome Extension Ingestor

Extension giúp bạn cào nhanh dữ liệu sản phẩm từ các website bán hàng (Lululemon, Aritzia, Kotn, RW&CO, Zara, v.v.) và đẩy trực tiếp vào **Style Advisor Catalog** chỉ với 1 cú click!

---

## 🚀 Hướng Dẫn Cài Đặt (Chỉ mất 30 giây)

1. Mở trình duyệt **Google Chrome** (hoặc Brave / Microsoft Edge / Cốc Cốc).
2. Nhập vào thanh địa chỉ: `chrome://extensions` và bấm **Enter**.
3. Ở góc trên bên phải, **bật công tắc "Chế độ dành cho nhà phát triển" (Developer mode)**.
4. Ở góc trên bên trái, bấm vào nút **"Tải tiện ích đã giải nén" (Load unpacked)**.
5. Chọn thư mục `extension` trong dự án của bạn:
   👉 Đường dẫn: `/Users/tuanlt/Vibe-coding/Style Advisor/extension`
6. Bấm nút **Ghim (Pin 📌)** icon của Extension lên thanh công cụ của Chrome để tiện bấm.

---

## 🎯 Cách Dùng Để Cào Đồ Về Website

1. Đảm bảo website Style Advisor đang chạy ở `http://localhost:3000`.
2. Mở một trang sản phẩm bất kỳ trên mạng, ví dụ:
   - https://shop.lululemon.com/en-ca/p/double-knit-high-rise-pant/kpaqmttv5x
   - Hoặc bất kỳ sản phẩm nào trên Aritzia, Zara, Kotn...
3. Bấm vào icon **Style Advisor Ingestor** trên thanh công cụ Chrome.
4. Extension sẽ **tự động quét & lấy**:
   - Tên sản phẩm
   - Thương hiệu
   - Giá tiền (CAD)
   - Hình ảnh sản phẩm
   - Vị trí trang phục (Top, Bottom, Shoes, Outerwear...)
   - Chất liệu vải (Fabric)
5. Bạn có thể xem trước & chỉnh sửa nhanh nếu muốn, sau đó bấm nút:
   👉 **`[ 🚀 Ingest into Catalog ]`**
6. Mở lại trang `http://localhost:3000/admin`, bạn sẽ thấy món đồ vừa cào đã **tự động xuất hiện ngay trên đầu bảng Catalog**!
