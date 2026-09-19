# 🎨 Shorts Hunter Frontend — Modern React 18, Vite & Tailwind CSS UI

> **Giao diện người dùng hiện đại, phong cách Cyberpunk Dark Mode, hỗ trợ tìm kiếm video sản phẩm bằng AI, quản lý đa nền tảng và xuất dữ liệu Google Sheets 1-Click chuẩn xác.**

---

## 📑 Mục Lục
1. [Công Nghệ & Thư Viện Sử Dụng](#-công-nghệ--thư-viện-sử-dụng)
2. [Cấu Trúc Thư Mục Frontend](#-cấu-trúc-thư-mục-frontend)
3. [Chi Tiết Các Thành Phần Giao Diện (Components)](#-chi-tiết-các-thành-phần-giao-diện-components)
4. [Quản Lý Trạng Thái & LocalStorage Persistence](#-quản-lý-trạng-thái--localstorage-persistence)
5. [Tích Hợp API Backend (Axios Services)](#-tích-hợp-api-backend-axios-services)
6. [Hướng Dẫn Cài Đặt & Khởi Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
7. [Quy Chuẩn Xuất Bản Dữ Liệu Sang Google Sheets](#-quy-chuẩn-xuất-bản-dữ-liệu-sang-google-sheets)

---

## ⚡ Công Nghệ & Thư Viện Sử Dụng

* **React 18**: Thư viện xây dựng giao diện người dùng dựa trên Component và Hook hiện đại.
* **Vite 6**: Công cụ build & dev server siêu tốc độ (HMR trong vài mili-giây).
* **Tailwind CSS 3**: Framework CSS tiện ích (Utility-first) thiết kế giao diện tối tân, hỗ trợ Dark Mode và Gradient Glow effects.
* **Lucide React**: Bộ icon SVG chất lượng cao, đồng bộ và nhẹ.
* **Axios**: HTTP client xử lý kết nối API Backend với timeout tùy chỉnh lên tới 10 phút cho tác vụ AI.

---

## 📁 Cấu Trúc Thư Mục Frontend

```text
frontend/
├── index.html                  # File HTML chính với font Inter & metadata
├── package.json                # Quản lý dependencies & scripts (dev, build, preview)
├── vite.config.js              # Cấu hình Vite (Cổng mặc định 5173, Plugins React)
├── tailwind.config.js          # Cấu hình Theme, Color palette và animations
├── postcss.config.js           # Cấu hình xử lý Tailwind CSS
├── .env                        # Biến môi trường (VITE_API_BASE_URL=http://127.0.0.1:8000)
├── .env.example                # File mẫu biến môi trường
│
└── src/
    ├── main.jsx                # Entrypoint khởi tạo React DOM Root
    ├── App.jsx                 # Component trung tâm: Điều phối State, Pipeline & Bố cục
    ├── index.css               # Global styles, scrollbar tùy biến & CSS variables
    │
    ├── services/
    │   └── api.js              # Toàn bộ hàm gọi API Backend (Search, Health, Generate, Shorten)
    │
    └── components/
        ├── Header.jsx          # Thanh điều hướng: Trạng thái Server & Chip phần cứng (MPS/CUDA/CPU)
        ├── HeroSection.jsx     # Banner tiêu đề động và thông điệp sản phẩm
        ├── SearchForm.jsx      # Form tìm kiếm 5 Section cân xứng hoàn hảo
        ├── LoadingOverlay.jsx  # Màn hình chờ AI đa giai đoạn kèm đồng hồ đếm giây thời gian thực
        ├── ResultsGrid.jsx     # Lưới hiển thị Video dọc 9:16 & Banner Link sản phẩm
        ├── SheetGenerator.jsx  # Bộ công cụ tạo & xuất bảng Google Sheets 7 cột
        ├── VideoCard.jsx       # Thẻ video độc lập (Xem trực tiếp, tải về, điểm tin cậy AI)
        ├── ErrorAlert.jsx      # Hộp thông báo lỗi thân thiện với người dùng
        └── EmptyState.jsx      # Trạng thái chờ khởi tạo ban đầu
```

---

## 🧩 Chi Tiết Các Thành Phần Giao Diện (Components)

### 1. `Header.jsx`
* Hiển thị logo nhận diện thương hiệu **Shorts Hunter v3.0**.
* **Real-time Server Health Polling**: Tự động ping `/api/health` mỗi 15 giây.
* Hiển thị trạng thái kết nối (`Đã kết nối` / `Mất kết nối`) và chip phần cứng tăng tốc đang chạy trên Backend (`⚡ Apple MPS (Metal)`, `🚀 NVIDIA CUDA`, hoặc `💻 Multi-core CPU`).

### 2. `SearchForm.jsx` (Form 5 Khu Vực Cân Xứng Hoàn Hảo)
* **Section 1: AI Model Engine Selector**:
  - Switch chuyển đổi giữa **Google Gemini AI** và **Hugging Face Local**.
  - Dropdown chọn mô hình Google Gemini (`gemini-3.6-flash`, `gemini-3.6-pro`, `gemini-3.5-flash`, `gemini-3.1-pro`, `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`).
  - Ô nhập API Key kèm nút ẩn/hiện mật khẩu và link lấy Key trực tiếp từ Google AI Studio.
* **Section 2: Cột Link Video Mẫu & Link Sản Phẩm Gốc**:
  - *Cột Trái*: Cho phép dán từ 1 đến 5 link video mẫu đầu vào, có nút thêm/xóa linh hoạt.
  - *Cột Phải*: Ô dán Link sản phẩm Amazon. Tự động cắt và hiển thị huy hiệu `🏷️ ASIN: B0XXXXXXXX` ngay lập tức.
* **Section 3: Tên Sản Phẩm Amazon**:
  - Nhập tên/từ khóa sản phẩm chính thức.
* **Section 4: Tùy Chọn Nâng Cao**:
  - Nhập Thương hiệu (Brand) và Danh mục (Category) để AI mở rộng từ khóa tìm kiếm.
* **Section 5: Slider & Preset Boxes Chọn Nhanh Số Lượng**:
  - Thanh trượt từ 1 đến 25 video kết hợp ô nhập số trực tiếp.
  - **Hàng nút chọn nhanh (Quick Presets)**: `3 video`, `5 video`, `8 video`, `10 video`, `15 video`, `20 video`.

### 3. `LoadingOverlay.jsx`
* Hiển thị trạng thái đa tiến trình trực quan:
  1. *Khởi tạo & Phân tích liên kết đầu vào (0s)*
  2. *Mở rộng từ khóa & Cào video đa nền tảng (5s)*
  3. *Tải & Trích xuất khung hình Keyframes (15s)*
  4. *AI chấm điểm đối chiếu Thị giác & Ngữ nghĩa (30s)*
  5. *Tổng hợp & Xếp hạng kết quả tối ưu (45s+)*
* Đồng hồ bấm giờ thời gian thực giúp người dùng theo dõi tiến độ xử lý.

### 4. `ResultsGrid.jsx`
* Hiển thị danh sách video theo tỷ lệ dọc **9:16 chuẩn Shorts/TikTok**.
* Tự động gắn nhãn **⭐ Video Mẫu Đầu Vào** cho các video gốc của người dùng.
* Huy hiệu điểm tin cậy AI (`95% Match`, `88% Match`...).
* Thanh công cụ chọn nhanh: Chọn tất cả, Bỏ chọn, Đếm số video được chọn để tạo Sheet.
* Banner hiển thị đường link sản phẩm và mã ASIN đã bóc tách.

### 5. `SheetGenerator.jsx` (Trình Tạo Bảng Google Sheets Chuyên Nghiệp)
* Tự động lấy danh sách video đã tick chọn để tạo bảng chuẩn 7 cột:
  - **Cột A: Content** — Mỗi hàng là một Caption/Hook/Review hoàn toàn độc nhất (100% Unique).
  - **Cột B: URL** — Đường dẫn video gốc.
  - **Cột C: Link sp** — Tự động bọc qua Geniuslink (`geni.us`) kèm tùy biến câu dẫn phía trước link.
  - **Cột D: Page** — Tên Fanpage / Kênh mạng xã hội.
  - **Cột E: Trạng thái** — Lựa chọn giữa `Lên lịch` hoặc `Đã đăng`.
  - **Cột F: Post ( Date time)** — Mặc định để trống hoàn toàn theo chuẩn SOP.
  - **Cột G: Link Post** — Đường dẫn bài đã đăng (để trống nếu lên lịch).
* **Tùy biến Cột C linh hoạt**:
  - `⭐ [Tên SP] 👉 Link` *(Mặc định)*
  - `👉 Get it here 👉 Link`
  - `🔗 Link sp 👉 Link`
  - `🌐 Chỉ URL thuần`
  - `✏️ Tùy chỉnh câu dẫn riêng`
* **Nút Tính Năng Xuất Dữ Liệu**:
  - 📋 **Copy Dán Vào Google Sheets (TSV 1-Click)**: Chỉ copy dữ liệu, bỏ qua dòng Header Title, giúp dán chuẩn xác vào Google Sheets mà không bị lệch hàng.
  - 📝 **Copy Bảng Markdown Table**: Dán vào Notion, Obsidian, GitHub.
  - 📥 **Xuất File CSV**: Xuất file định dạng UTF-8 BOM chuẩn tiếng Việt.
  - 🔄 **AI Sinh Lại Content Mới**: Gọi lại AI để làm mới toàn bộ nội dung Cột A trong 1 giây.

---

## 💾 Quản Lý Trạng Thái & LocalStorage Persistence

Ứng dụng tự động lưu trữ cấu hình người dùng vào trình duyệt để không phải nhập lại mỗi lần tải lại trang:
* `shorts_hunter_gemini_api_key`: Lưu trữ an toàn Google Gemini API Key.
* `shorts_hunter_gemini_model`: Lưu trữ model AI ưa thích (`gemini-3.6-flash`).
* `shorts_hunter_ai_provider`: Lưu lựa chọn giữa `gemini` hoặc `local`.
* `shorts_hunter_affiliate_settings_v8`: Lưu cấu hình Geniuslink Group ID, Page name, Trạng thái mặc định, Định dạng Cột C.

---

## 🌐 Tích Hợp API Backend (Axios Services)

File `src/services/api.js` quản lý tất cả tương tác mạng:
* `extractAsinFromUrl(url)`: Hàm regex trích xuất mã ASIN phía Frontend.
* `searchVideos(params)`: Gửi yêu cầu tìm kiếm đến `/api/v1/product-video-retrieval`.
* `generateSocialCaptions(params)`: Gửi yêu cầu sinh content đến `/api/v1/content/generate`.
* `shortenAffiliateLink(params)`: Gửi link đến `/api/v1/affiliate/shorten`.
* `checkHealth()`: Kiểm tra trạng thái máy chủ.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt các gói phụ thuộc (Dependencies)
```bash
cd frontend
npm install
```

### 2. Khởi động môi trường phát triển (Development)
```bash
npm run dev
```
Truy cập tại: `http://localhost:5173`

### 3. Đóng gói cho môi trường thực tế (Production Build)
```bash
npm run build
```
Thư mục sản phẩm đầu ra sẽ nằm tại `frontend/dist/`.

---

## 📊 Quy Chuẩn Xuất Bản Dữ Liệu Sang Google Sheets

Khi bấm **"Copy Dán Vào Google Sheets"**:
1. Dữ liệu được đưa vào Clipboard dưới dạng TSV (Tab-Separated Values).
2. Sang Google Sheets của bạn, đặt con trỏ tại ô **A2** (dưới hàng tiêu đề sẵn có).
3. Nhấn **Ctrl + V** (hoặc **Cmd + V** trên Mac). Toàn bộ 7 cột sẽ được điền chuẩn xác 100%!
