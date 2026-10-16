# Ma Trận Truy Vết (RTM) — Perfex CRM (Anh Tester Demo) · Tổng hợp

> **Tóm tắt:** 40/40 REQ trong phạm vi đã có TC (100%) · **20/51 TC có script automation** (39%) · 51/51 TC đã chạy ít nhất 1 lần, 45 PASS / 6 FAIL · **chỉ 1/23 module** nằm trong RTM này

| Thông tin | Nội dung |
|---|---|
| Ngày cập nhật | 16-10-2026 08:54 |
| Lần sinh gần nhất | `login` — file chung tạo mới lần đầu |
| Mốc git | — thư mục dự án **chưa phải git repo**. Từng module có cột riêng ở Bản đồ tài liệu |
| Nguồn đã quét | Automation: `src/tests/auth/*.spec.ts` (Playwright) · Checklist: chưa có · Kết quả chạy: `docs/executions/login/web/` (2 lần chạy tay) · Bug: `docs/bugs/README.md` |

## ⬛ Ngoài tầm nhìn của RTM — đọc trước mọi con số

| Nhóm | Số module | Module | Ý nghĩa |
|---|:-:|---|---|
| ⬜ Chưa khảo sát | 20 | `CONT` · `LEAD` · `TASK` · `EST` · `PROP` · `INV` · `PAY` · `CN` · `SUB` · `CTR` · `EXP` · `ITEM` · `TICK` · `ESTREQ` · `KB` · `REP` · `DASH` · `TODO` · `REM` · `PROF` | Không có REQ — không xuất hiện trong mọi % |
| 📄 Có REQ, chưa có TC | 1 | `PRJ` (104 REQ) | Tính vào thì Requirement Coverage chỉ còn **40/144 (~28%)** — chưa tính `CUST` vì chưa đo |
| 🕓 Chưa sinh RTM | 1 | `CUST` (84 REQ · 129 TC) | Có REQ + TC nhưng chưa chạy `/generate-traceability-matrix customers` |

> Namespace `_book-api` (hệ thống thứ hai trong repo) có danh mục riêng, **không** thuộc RTM này.

## 1. Độ phủ theo module

| Module | REQ trong phạm vi | Requirement Coverage | TC | Automation | Lần chạy gần nhất |
|---|:-:|---|:-:|---|---|
| **Đăng nhập / Xác thực** `LOGIN` | 40 (+4 loại trừ) | `▰▰▰▰▰` 40/40 | 51 | `▰▰▱▱▱` 20/51 | `▰▰▰▰▱` 45 PASS · ❌ 6 FAIL |
| **Tổng** | **40** (+4 loại trừ) | `▰▰▰▰▰` **40/40** | **51** | `▰▰▱▱▱` **20/51** | 45 PASS · ❌ 6 FAIL |

## 2. Việc cần làm — gộp mọi module, xếp theo mức nghiêm trọng

| # | Việc | Module | Số lượng | Command |
|:-:|---|---|:-:|---|
| 1 | 🔴 Sinh TC cho REQ chưa có TC | `PRJ` | 104 REQ | `/generate-testcases-manual-rbt` |
| 2 | ❌ Retest TC FAIL đã có bug đang mở | `LOGIN` | 5 TC | `/retest-fixed-bugs` |
| 3 | ❌ Chạy lại TC FAIL chỉ có bug đã đóng (kết quả lỗi thời) | `LOGIN` | 1 TC (`CRM_LOGIN_TC_018`) | `/execute-test-cases` |
| 4 | 🕓 Sinh RTM cho module đã có REQ + TC | `CUST` | 1 module | `/generate-traceability-matrix customers` |
| 5 | ⚠️ Thống nhất Story của `REQ-LOGIN-43` giữa index và file web | `LOGIN` | 1 REQ | `/update-requirements-from-ticket` |
| 6 | 🟡 Automate TC Critical/High đã chấm `Automation = Yes` | `LOGIN` | 9 TC | `/generate-automation-from-testcases` |

## Bản đồ tài liệu

| Module | File RTM | Ngày sinh | Mốc git |
|---|---|---|---|
| `LOGIN` | [login/traceability_matrix_login.md](login/traceability_matrix_login.md) · bản HTML [../rtm/rtm_report_login.html](../rtm/rtm_report_login.html) | 16-10-2026 08:54 | — chưa có git |
| `CUST` | — chưa sinh | — | — |
| `PRJ` | — chưa sinh (chưa có TC) | — | — |
