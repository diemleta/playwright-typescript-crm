# Automation Web — Progress (mode TC) · `CRM_LOGIN_TC_002` → `CRM_LOGIN_TC_020`

- [x] Bước 1: Phân tích test cases (19 TC → 31 test tính cả biến thể)
- [x] Bước 2: Khảo sát UI — trang đăng nhập, trạng thái lỗi, logo, cổng khách hàng `/login`, Dashboard (user tự đăng nhập trong cửa sổ MCP)
- [x] Bước 3: POM — `AuthFormPage` (chung) · `LoginPage` · `CustomerLoginPage` · `DashboardPage`
- [x] Bước 4: Test data — `test-data/login.json`, email không tồn tại sinh bằng `TestData.email()`
- [x] Bước 5: Scripts — `login.spec.ts` · `login-validation.spec.ts` · `login-success.spec.ts` · `login-access.spec.ts`
- [ ] Bước 6: Ổn định — nhóm không đăng nhập PASS 2/2 · nhóm `@authenticated` mới chạy **1/2** lần (user chạy 12-10-2026 10:45)

## Kết Quả

| TC ID | Status | Stability | Ghi chú |
|---|---|---|---|
| 002 · 003 | ✅ PASS | 2/2 | — |
| 004 | ✅ FAIL đúng kỳ vọng | 2/2 | Bug đang mở `BUG_login_1787226513_TC004` — `test.fail()` |
| 005 · 006 · 007 a-d · 008 · 009 · 010 · 015 a-b | ✅ PASS | 1/2 | Đăng nhập thật — user tự chạy, cần thêm 1 lần |
| 011 a-d · 012 a-e · 013 · 017 a-b · 018 | ✅ PASS | 2/2 | — |
| 014 | ✅ PASS | 2/2 | Gỡ skip cứng, chạy bằng tài khoản `TC014_EMAIL` / `TC014_PASSWORD` (16-10-2026) |
| 016 | ✅ FAIL đúng kỳ vọng | 2/2 | Bug đang mở `BUG_login_1787226514_TC016` — `test.fail()` |
| 019 · 020 | ⚠️ PASS 16-10-2026 (trước đó FAIL) | — | Phụ thuộc dữ liệu môi trường dùng chung, KHÔNG phải bug app: tiêu đề cổng khách hàng là tên công ty của tài khoản (`Customer Example`), TC ghi `HKD Anh Tester`. User chọn giữ assertion — cần cập nhật TC hoặc đổi tài khoản |

## Files

- `src/pages/auth-form.page.ts` (mới) · `customer-login.page.ts` (mới) · `dashboard.page.ts` (mới) · `login.page.ts` · `base.page.ts`
- `src/tests/auth/login.spec.ts` · `login-validation.spec.ts` (mới) · `login-success.spec.ts` (mới) · `login-access.spec.ts` (mới)
- `src/utils/report.ts` (mới) · `env.config.ts` · `test-data.ts` · `test-data/login.json`
