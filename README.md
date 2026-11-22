# KHO HỌC LIỆU SỐ – HƯỚNG DẪN TỪNG BƯỚC

Website giao diện tiếng Việt giống bố cục ảnh mẫu. Trang công khai, tìm kiếm, lọc lớp/danh mục, xem và tải tài liệu; chỉ tài khoản trong bảng `admins` mới được thêm/sửa/xóa. File nằm trong Supabase Storage, không nằm trên Cloudflare.

## Bước 1 – Tạo cấu trúc dữ liệu Supabase
1. Mở https://supabase.com/dashboard và chọn dự án `kho-hoc-lieu-so`.
2. Chọn **SQL Editor** > **New query**.
3. Mở file `supabase.sql` trong bộ mã nguồn, sao chép toàn bộ và dán vào SQL Editor, bấm **Run**.
4. Mở **Table Editor** kiểm tra đã có bảng `posts` và `admins`. Mở **Storage** kiểm tra có `covers` và `documents`.
5. Nếu Supabase báo lỗi về dung lượng bucket hoặc giới hạn của gói miễn phí, giảm `20971520` trong SQL xuống giới hạn được phép và chỉnh tương ứng trong `logic.js`.

## Bước 2 – Tạo quản trị viên
1. Supabase > **Authentication** > **Users** > **Add user** (hoặc Invite user nếu có). Nhập email của chính bạn, đặt mật khẩu mạnh, xác nhận email theo hướng dẫn.
2. Mở user vừa tạo, sao chép **User UID** (chuỗi UUID), KHÔNG sao chép mật khẩu.
3. Vào **SQL Editor** > **New query**, chạy câu lệnh (thay UUID):
   `insert into public.admins(user_id) values ('UUID_CUA_BAN');`
4. Không bật đăng ký tài khoản công khai nếu không cần. Chỉ thêm người khác vào `admins` khi thực sự muốn trao quyền quản trị.

## Bước 3 – Lấy thông tin kết nối
1. Supabase > **Project Settings** > **API Keys** (hoặc **Connect** tùy giao diện).
2. Sao chép **Project URL** và **publishable key** (hoặc legacy `anon` key). Tuyệt đối KHÔNG dùng `service_role` / secret key trong website.
3. Trong bộ mã nguồn, đổi tên `.env.example` thành `.env` và thay:
   `VITE_SUPABASE_URL=https://...supabase.co`
   `VITE_SUPABASE_ANON_KEY=sb_publishable_...`
4. File `.env` được Git bỏ qua; không đưa mật khẩu hoặc secret key lên GitHub.

## Bước 4 – Thử website trên máy tính (tùy chọn)
1. Cài Node.js bản LTS (https://nodejs.org/).
2. Giải nén ZIP, mở Terminal trong thư mục `kho-hoc-lieu-so`.
3. Chạy `npm install` rồi `npm run dev`.
4. Mở địa chỉ localhost hiện trong Terminal. Kiểm tra đăng nhập, đăng tài liệu và tải file.

## Bước 5 – Đưa mã nguồn lên GitHub (không cần gõ Git)
1. Mở https://github.com/new, đăng nhập GitHub.
2. Repository name: `kho-hoc-lieu-so`; chọn **Private** hoặc **Public**; bấm **Create repository**.
3. Trong repository, chọn **uploading an existing file** / **Add file > Upload files**.
4. Tải lên các file `index.html`, `src.js`, `style.css`, `logic.js`, `logic.test.js`, `package.json`, `supabase.sql`, `README.md`, `.gitignore`, `.env.example`. Không tải `.env`, `node_modules`, `dist`.
5. Bấm **Commit changes**. Nếu GitHub không hiển thị file bắt đầu bằng dấu chấm, tạo bằng **Add file > Create new file**.

## Bước 6 – Xuất bản Cloudflare Pages
1. Mở https://dash.cloudflare.com/ > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git** (tên có thể khác một chút).
2. Kết nối GitHub và chọn repository `kho-hoc-lieu-so`.
3. Cấu hình: Framework preset = **Vite** hoặc **None**; Production branch = `main`; Build command = `npm run build`; Build output directory = `dist`.
4. Trong **Environment variables**, thêm hai biến `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` với giá trị từ Supabase. Chỉ sử dụng publishable/anon key. Nếu dùng preview deployments, thêm cả biến cho Preview.
5. Chọn **Save and Deploy**. Chờ trạng thái thành công. Mở địa chỉ dạng `https://kho-hoc-lieu-so.pages.dev` (tên thực tế do Cloudflare cấp, có thể khác).
6. Cloudflare tự cấp HTTPS. Khi cập nhật GitHub, Cloudflare sẽ tự triển khai lại.

## Bước 7 – Đăng tài liệu đầu tiên
1. Mở website, bấm **Đăng nhập quản trị**, nhập email và mật khẩu đã tạo ở Supabase.
2. Bấm **Đăng bài mới**, điền tiêu đề, mô tả, chọn lớp và danh mục.
3. Chọn ảnh đại diện (tối đa 5 MB), file học liệu (tối đa 20 MB), bấm **Đăng bài**.
4. Đăng xuất, thử tìm bài vừa đăng, bấm **Xem tài liệu** và **Tải tài liệu**.
5. Với Word/PowerPoint, trình duyệt có thể tải file thay vì xem trực tiếp. PDF và ảnh thường xem được ngay; video tùy trình duyệt.

## Xử lý sự cố
- **Trang trắng / Build failed:** kiểm tra hai biến môi trường, `npm run build`, thư mục `dist`.
- **Không đăng nhập được:** kiểm tra Authentication > Users, email đã xác nhận, mật khẩu đúng.
- **Đăng nhập nhưng không có quyền:** kiểm tra bảng `admins` chứa đúng User UID.
- **Không tải file được:** kiểm tra SQL đã chạy đầy đủ, bucket `documents` và chính sách `public download documents`.
- **File quá lớn:** gói Supabase có giới hạn kích thước file và dung lượng lưu trữ; bộ mã nguồn giới hạn 20 MB mỗi file, video lớn nên dùng giải pháp lưu trữ khác.
- **Danh sách trống:** kiểm tra bảng `posts`, chính sách đọc công khai và Console trình duyệt.

## Lưu ý an toàn
- Khóa publishable/anon được phép xuất hiện ở trình duyệt; bảo mật thực tế dựa vào RLS và chính sách Storage trong SQL.
- Không đưa `service_role`/secret key vào biến `VITE_...`.
- Bucket tài liệu cho phép mọi người tải về; không tải lên dữ liệu riêng tư của học sinh, thông tin cá nhân hoặc tài liệu có bản quyền khi chưa được phép.
- Dự án chưa có bộ quét virus, giới hạn lượt tải hoặc sao lưu tự động. Hãy sao lưu tài liệu quan trọng định kỳ.
