# Ma Trận Truy Vết (RTM) — Đăng nhập / Xác thực (`LOGIN`)

> **Tóm tắt:** 40/40 REQ trong phạm vi đã có TC (100%) · **20/51 TC có script automation** (39%) · lần chạy tay gần nhất 45 PASS / 6 FAIL — 5 FAIL có bug đang mở · 4 REQ loại trừ theo quyết định PO 18-08-2026

| Thông tin | Nội dung |
|---|---|
| Ngày sinh | 16-10-2026 08:54 |
| Phạm vi | Module `LOGIN` · web |
| Mốc git | — thư mục dự án **chưa phải git repo** (`git log` không chạy được). Lần sinh sau nếu đã có git thì ghi hash commit vào đây |
| Nguồn đã quét | REQ: `requirements/login/` (44 REQ — index + `web/requirements_login_web.md`) · TC: `testcases/login/web/test_cases_login_web.md` (51 TC, 0 `@Deprecated`) · Automation: `src/tests/auth/*.spec.ts` (4 file, 20 TC, 32 test tính cả biến thể) · Kết quả chạy: `executions/login/web/run_1787215085`, `run_1789759574` (chạy tay) · Bug: `bugs/README.md` (5 đang mở · 1 đã đóng) · Checklist: chưa có — ẩn cột `Checklist` |
| Tổng hợp | [../traceability_matrix.md](../traceability_matrix.md) — ⬛ module ngoài tầm nhìn của RTM nằm ở đó |
| Bản HTML | [../../rtm/rtm_report_login.html](../../rtm/rtm_report_login.html) — báo cáo trực quan, lọc/tìm theo REQ · TC · Story, mở offline bằng trình duyệt |

> ℹ️ Cột `Kết quả gần nhất` lấy từ **execution report chạy tay** (`docs/executions/`). Lần chạy automation 16-10-2026 (Playwright, 32/32 test pass) **không** ghi vào `docs/executions/` nên không tính vào đây. Hai lần chạy đó khớp nhau ở `TC_004`, `TC_016` (vẫn lỗi như bug đang mở), và `TC_014` chạy automation PASS 2/2 lần.

## 1. Tổng quan

| Chỉ số | Tiến độ | Giá trị |
|---|---|---|
| Requirement Coverage | `▰▰▰▰▰▰▰▰▰▰` | **40/40** (100%) REQ trong phạm vi (+4 loại trừ) |
| Platform Coverage · web | `▰▰▰▰▰▰▰▰▰▰` | 40/40 cặp REQ × nền tảng |
| Automation Coverage | `▰▰▰▰▱▱▱▱▱▱` | **20/51** TC (39%) |
| Pass rate lần chạy gần nhất | `▰▰▰▰▰▰▰▰▰▱` | 45/51 (88%) · ❌ 6 FAIL · 0 TC chưa chạy |

**Phân bổ REQ theo trạng thái:**

| ✅ Đã automate | 🟣 Automate một phần | 🟡 Thủ công | 🟠 Chỉ checklist | 🔴 Chưa có TC | ⏭️ Loại trừ |
|:-:|:-:|:-:|:-:|:-:|:-:|
| 16 | 5 | 19 | 0 | 0 | 4 |

> Automation hiện chỉ phủ **STORY-LOGIN-01 → 03** (+ `REQ-LOGIN-43`). STORY-LOGIN-04 (trừ `43`), 05 và 06 còn **hoàn toàn chạy tay** — đây là vùng hở lớn nhất.

## 2. Việc cần làm

1. ❌ **5 TC FAIL đã có bug đang mở** — `CRM_LOGIN_TC_004`, `CRM_LOGIN_TC_016`, `CRM_LOGIN_TC_028`, `CRM_LOGIN_TC_029`, `CRM_LOGIN_TC_039` → `/retest-fixed-bugs` khi Dev báo fix
2. ❌ **1 TC FAIL chỉ có bug đã đóng** — `CRM_LOGIN_TC_018`: `BUG_login_1787226515_TC018` đóng 19-09-2026 (không phải lỗi), biến thể `a` gây FAIL đã bị bỏ khỏi TC cùng ngày → kết quả FAIL đã lỗi thời, chạy lại bằng `/execute-test-cases`
3. 🟡 **Automate 9 TC Critical/High đã chấm `Automation = Yes`** — `CRM_LOGIN_TC_021`, `CRM_LOGIN_TC_025`, `CRM_LOGIN_TC_032`, `CRM_LOGIN_TC_036` (Critical) · `CRM_LOGIN_TC_027`, `CRM_LOGIN_TC_028`, `CRM_LOGIN_TC_029`, `CRM_LOGIN_TC_035`, `CRM_LOGIN_TC_039` (High) → `/generate-automation-from-testcases`
4. ⚠️ **Xác nhận Story của `REQ-LOGIN-43`** — index ghi STORY-LOGIN-03, file web đặt ở mục 3.4 (STORY-LOGIN-04). RTM này nhóm theo file web. Sửa cho thống nhất ở lần chạy `/update-requirements-from-ticket` tới

## 3. Ma trận chi tiết

### 3.1. Giao diện trang đăng nhập (STORY-LOGIN-01)

`▰▰▰▰▰` 7/7 REQ có TC · ✅ 6 · 🟣 1

| REQ ID | Yêu cầu | TC IDs | Automation | Kết quả gần nhất | Trạng thái |
|---|---|---|---|:-:|---|
| REQ-LOGIN-01 | Truy cập trang đăng nhập | CRM_LOGIN_TC_001 | `auth/login.spec.ts` (1/1) | ✅ 1 | ✅ Đã automate |
| REQ-LOGIN-02 | Thành phần biểu mẫu đăng nhập | CRM_LOGIN_TC_002, CRM_LOGIN_TC_038, CRM_LOGIN_TC_042, CRM_LOGIN_TC_043, CRM_LOGIN_TC_044, CRM_LOGIN_TC_048, CRM_LOGIN_TC_049, CRM_LOGIN_TC_050 | `auth/login.spec.ts` (1/8) | ✅ 8 | 🟣 Automate một phần |
| REQ-LOGIN-03 | Tự động đặt con trỏ vào ô Email | CRM_LOGIN_TC_002 | `auth/login.spec.ts` (1/1) | ✅ 1 | ✅ Đã automate |
| REQ-LOGIN-04 | Logo dẫn về trang chủ | CRM_LOGIN_TC_004 | `auth/login.spec.ts` (1/1) | ❌ 1 🐞 | ✅ Đã automate |
| REQ-LOGIN-05 | Không có CAPTCHA | CRM_LOGIN_TC_003 | `auth/login.spec.ts` (1/1) | ✅ 1 | ✅ Đã automate |
| REQ-LOGIN-36 | Không có đăng nhập mạng xã hội | CRM_LOGIN_TC_003 | `auth/login.spec.ts` (1/1) | ✅ 1 | ✅ Đã automate |
| REQ-LOGIN-37 | Trang đăng nhập không nạp tệp JavaScript nào | CRM_LOGIN_TC_003 | `auth/login.spec.ts` (1/1) | ✅ 1 | ✅ Đã automate |

### 3.2. Đăng nhập thành công (STORY-LOGIN-02)

`▰▰▰▰▰` 5/5 REQ có TC · ✅ 4 · 🟣 1

| REQ ID | Yêu cầu | TC IDs | Automation | Kết quả gần nhất | Trạng thái |
|---|---|---|---|:-:|---|
| REQ-LOGIN-06 | Đăng nhập bằng thông tin hợp lệ | CRM_LOGIN_TC_005, CRM_LOGIN_TC_006, CRM_LOGIN_TC_010, CRM_LOGIN_TC_041, CRM_LOGIN_TC_050 | `auth/login-success.spec.ts` (3/5) | ✅ 5 | 🟣 Automate một phần |
| REQ-LOGIN-07 | Email không phân biệt hoa thường | CRM_LOGIN_TC_007 | `auth/login-success.spec.ts` (1/1) | ✅ 1 | ✅ Đã automate |
| REQ-LOGIN-38 | Email bỏ qua khoảng trắng thừa đầu/cuối | CRM_LOGIN_TC_007 | `auth/login-success.spec.ts` (1/1) | ✅ 1 | ✅ Đã automate |
| REQ-LOGIN-08 | Ghi nhớ đăng nhập sinh cookie `autologin` | CRM_LOGIN_TC_008 | `auth/login-success.spec.ts` (1/1) | ✅ 1 | ✅ Đã automate |
| REQ-LOGIN-09 | Không tích Ghi nhớ thì không phát hành cookie `autologin` | CRM_LOGIN_TC_009 | `auth/login-success.spec.ts` (1/1) | ✅ 1 | ✅ Đã automate |

### 3.3. Kiểm tra dữ liệu đầu vào & đăng nhập thất bại (STORY-LOGIN-03)

`▰▰▰▰▰` 8/8 REQ có TC · ✅ 5 · 🟣 3

| REQ ID | Yêu cầu | TC IDs | Automation | Kết quả gần nhất | Trạng thái |
|---|---|---|---|:-:|---|
| REQ-LOGIN-10 | Bỏ trống cả hai trường | CRM_LOGIN_TC_011, CRM_LOGIN_TC_043 | `auth/login-validation.spec.ts` (1/2) | ✅ 2 | 🟣 Automate một phần |
| REQ-LOGIN-11 | Bỏ trống riêng Email | CRM_LOGIN_TC_011 | `auth/login-validation.spec.ts` (1/1) | ✅ 1 | ✅ Đã automate |
| REQ-LOGIN-12 | Bỏ trống riêng Mật khẩu | CRM_LOGIN_TC_011 | `auth/login-validation.spec.ts` (1/1) | ✅ 1 | ✅ Đã automate |
| REQ-LOGIN-13 | Chặn email sai định dạng ngay tại trình duyệt | CRM_LOGIN_TC_012, CRM_LOGIN_TC_045, CRM_LOGIN_TC_046 | `auth/login-validation.spec.ts` (1/3) | ✅ 3 | 🟣 Automate một phần |
| REQ-LOGIN-14 | Thông báo khi sai thông tin đăng nhập | CRM_LOGIN_TC_013, CRM_LOGIN_TC_014, CRM_LOGIN_TC_017, CRM_LOGIN_TC_018, CRM_LOGIN_TC_040, CRM_LOGIN_TC_045, CRM_LOGIN_TC_047, CRM_LOGIN_TC_050 | `auth/login-validation.spec.ts` (4/8) | ✅ 7 · ❌ 1 | 🟣 Automate một phần |
| REQ-LOGIN-15 | Thông báo lỗi không tiết lộ email nào có thật | CRM_LOGIN_TC_013, CRM_LOGIN_TC_019 | `auth/login-validation.spec.ts`, `auth/login-access.spec.ts` (2/2) | ✅ 2 | ✅ Đã automate |
| REQ-LOGIN-41 | Không khoá tài khoản sau nhiều lần đăng nhập sai | CRM_LOGIN_TC_015 | `auth/login-validation.spec.ts` (1/1) | ✅ 1 | ✅ Đã automate |
| REQ-LOGIN-16 | Máy chủ **phải** giữ lại email đã nhập sau khi đăng nhập thất bại | CRM_LOGIN_TC_016 | `auth/login-validation.spec.ts` (1/1) | ❌ 1 🐞 | ✅ Đã automate |

### 3.4. Bảo vệ phiên & điều hướng (STORY-LOGIN-04)

`▰▰▰▰▰` 9/9 REQ có TC · ✅ 1 · 🟡 8

| REQ ID | Yêu cầu | TC IDs | Automation | Kết quả gần nhất | Trạng thái |
|---|---|---|---|:-:|---|
| REQ-LOGIN-17 | Chặn URL nội bộ khi chưa đăng nhập | CRM_LOGIN_TC_021 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-18 | Không ghi nhớ URL đích sau khi chuyển hướng | CRM_LOGIN_TC_022 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-19 | Đã đăng nhập thì không vào lại trang đăng nhập | CRM_LOGIN_TC_023 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-20 | Đã đăng nhập thì không vào trang Quên mật khẩu | CRM_LOGIN_TC_023 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-43 | Tài khoản khách hàng không đăng nhập được vào khu quản trị | CRM_LOGIN_TC_019, CRM_LOGIN_TC_020 | `auth/login-access.spec.ts` (2/2) | ✅ 2 | ✅ Đã automate |
| REQ-LOGIN-42 | Phiên đăng nhập hết hạn sau 1 giờ | CRM_LOGIN_TC_026, CRM_LOGIN_TC_051 | — | ✅ 2 | 🟡 Thủ công |
| REQ-LOGIN-21 | Biểu mẫu đăng nhập mang mã chống CSRF | CRM_LOGIN_TC_024 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-22 | Từ chối yêu cầu có mã CSRF sai | CRM_LOGIN_TC_025 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-44 | Ép truy cập qua HTTPS | CRM_LOGIN_TC_039 | — | ❌ 1 🐞 | 🟡 Thủ công |

### 3.5. Quên mật khẩu (STORY-LOGIN-05)

`▰▰▰▰▰` 5/5 REQ có TC · 🟡 5 · ⏭️ 1

| REQ ID | Yêu cầu | TC IDs | Automation | Kết quả gần nhất | Trạng thái |
|---|---|---|---|:-:|---|
| REQ-LOGIN-23 | Truy cập trang Quên mật khẩu | CRM_LOGIN_TC_027 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-24 | Trang Quên mật khẩu không có lối quay lại đăng nhập | CRM_LOGIN_TC_027 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-25 | Gửi biểu mẫu Quên mật khẩu khi bỏ trống email | CRM_LOGIN_TC_028 | — | ❌ 1 🐞 | 🟡 Thủ công |
| REQ-LOGIN-26 | Email không tồn tại trong hệ thống | CRM_LOGIN_TC_029, CRM_LOGIN_TC_030 | — | ✅ 1 · ❌ 1 🐞 | 🟡 Thủ công |
| REQ-LOGIN-27 | Email tồn tại thì gửi liên kết đặt lại mật khẩu | — | — | — | ⏭️ Loại trừ |
| REQ-LOGIN-28 | Liên kết đặt lại mật khẩu sai/hết hạn | CRM_LOGIN_TC_031 | — | ✅ 1 | 🟡 Thủ công |

### 3.6. Đăng xuất & vòng đời cookie ghi nhớ (STORY-LOGIN-06)

`▰▰▰▰▰` 6/6 REQ có TC · 🟡 6 · ⏭️ 3

| REQ ID | Yêu cầu | TC IDs | Automation | Kết quả gần nhất | Trạng thái |
|---|---|---|---|:-:|---|
| REQ-LOGIN-29 | Mỗi viewport có **một** lối đăng xuất dùng được | CRM_LOGIN_TC_032, CRM_LOGIN_TC_033 | — | ✅ 2 | 🟡 Thủ công |
| REQ-LOGIN-30 | Cảnh báo khi còn bộ đếm giờ đang chạy | CRM_LOGIN_TC_034 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-31 | Đăng xuất ngay khi không có bộ đếm giờ | CRM_LOGIN_TC_035 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-32 | Kết thúc phiên và về trang đăng nhập | CRM_LOGIN_TC_036 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-33 | URL nội bộ bị chặn lại sau khi đăng xuất | CRM_LOGIN_TC_036 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-34 | Cookie `autologin` không bị xoá khỏi trình duyệt khi đăng xuất | — | — | — | ⏭️ Loại trừ |
| REQ-LOGIN-35 | Cookie `autologin` đọc được bằng JavaScript | — | — | — | ⏭️ Loại trừ |
| REQ-LOGIN-39 | Cookie `autologin` không tự đăng nhập lại sau khi đăng xuất chủ động | CRM_LOGIN_TC_037 | — | ✅ 1 | 🟡 Thủ công |
| REQ-LOGIN-40 | Cookie `autologin` khi phiên hết hạn tự nhiên | — | — | — | ⏭️ Loại trừ |

### ⏭️ REQ loại trừ có chủ đích — không tính vào mẫu số

| REQ ID | Lý do | Căn cứ |
|---|---|---|
| REQ-LOGIN-27 | Không kiểm chứng luồng gửi mail đặt lại với email có thật | `AMB-LOGIN-04` ⏭️ — quyết định PO 18-08-2026 |
| REQ-LOGIN-34 | Cookie ghi nhớ không bị xoá khi đăng xuất — chỉ ghi nhận hiện trạng | `AMB-LOGIN-06` ⏭️ |
| REQ-LOGIN-35 | Cookie ghi nhớ thiếu cờ `HttpOnly` — chỉ ghi nhận hiện trạng cho `RISK-LOGIN-02` | `AMB-LOGIN-07` ⏭️ |
| REQ-LOGIN-40 | Ghi nhớ đăng nhập khi phiên hết hạn tự nhiên — PO xác nhận tính năng **không hoạt động** | `AMB-LOGIN-15` ⏭️ |

Căn cứ: bảng *REQ cố ý KHÔNG có TC* ở [TEST_CASES_LOGIN_SUMMARY.md](../../testcases/login/TEST_CASES_LOGIN_SUMMARY.md).

## 4. 🟡 TC chưa automate

31/51 TC chưa có script. Số TC theo `Priority` × cột `Automation` dự kiến của bộ TC:

| Priority | Automation = Yes | Partial | No | Tổng |
|---|:-:|:-:|:-:|:-:|
| Critical | 4 | 0 | 0 | 4 |
| High | 5 | 2 | 2 | 9 |
| Medium | 14 | 1 | 0 | 15 |
| Low | 1 | 1 | 1 | 3 |
| **Tổng** | **24** | **4** | **3** | **31** |

<details><summary>Danh sách đầy đủ 31 TC chưa automate (xếp theo Priority)</summary>

| TC ID | Priority | Automation dự kiến | REQ | Kết quả gần nhất |
|---|---|---|---|:-:|
| CRM_LOGIN_TC_021 | Critical | Yes | REQ-LOGIN-17 | ✅ |
| CRM_LOGIN_TC_025 | Critical | Yes | REQ-LOGIN-22 | ✅ |
| CRM_LOGIN_TC_032 | Critical | Yes | REQ-LOGIN-29 | ✅ |
| CRM_LOGIN_TC_036 | Critical | Yes | REQ-LOGIN-32, REQ-LOGIN-33 | ✅ |
| CRM_LOGIN_TC_024 | High | Partial | REQ-LOGIN-21 | ✅ |
| CRM_LOGIN_TC_026 | High | No | REQ-LOGIN-42 | ✅ |
| CRM_LOGIN_TC_027 | High | Yes | REQ-LOGIN-23, REQ-LOGIN-24 | ✅ |
| CRM_LOGIN_TC_028 | High | Yes | REQ-LOGIN-25 | ❌ 🐞 |
| CRM_LOGIN_TC_029 | High | Yes | REQ-LOGIN-26 | ❌ 🐞 |
| CRM_LOGIN_TC_035 | High | Yes | REQ-LOGIN-31 | ✅ |
| CRM_LOGIN_TC_037 | High | Partial | REQ-LOGIN-39 | ✅ |
| CRM_LOGIN_TC_039 | High | Yes | REQ-LOGIN-44 | ❌ 🐞 |
| CRM_LOGIN_TC_051 | High | No | REQ-LOGIN-42 | ✅ |
| CRM_LOGIN_TC_022 | Medium | Yes | REQ-LOGIN-18 | ✅ |
| CRM_LOGIN_TC_023 | Medium | Yes | REQ-LOGIN-19, REQ-LOGIN-20 | ✅ |
| CRM_LOGIN_TC_030 | Medium | Yes | REQ-LOGIN-26 | ✅ |
| CRM_LOGIN_TC_031 | Medium | Yes | REQ-LOGIN-28 | ✅ |
| CRM_LOGIN_TC_033 | Medium | Yes | REQ-LOGIN-29 | ✅ |
| CRM_LOGIN_TC_034 | Medium | Yes | REQ-LOGIN-30 | ✅ |
| CRM_LOGIN_TC_038 | Medium | Yes | REQ-LOGIN-02 | ✅ |
| CRM_LOGIN_TC_040 | Medium | Partial | REQ-LOGIN-14 | ✅ |
| CRM_LOGIN_TC_042 | Medium | Yes | REQ-LOGIN-02 | ✅ |
| CRM_LOGIN_TC_043 | Medium | Yes | REQ-LOGIN-02, REQ-LOGIN-10 | ✅ |
| CRM_LOGIN_TC_045 | Medium | Yes | REQ-LOGIN-13, REQ-LOGIN-14 | ✅ |
| CRM_LOGIN_TC_046 | Medium | Yes | REQ-LOGIN-13 | ✅ |
| CRM_LOGIN_TC_047 | Medium | Yes | REQ-LOGIN-14 | ✅ |
| CRM_LOGIN_TC_049 | Medium | Yes | REQ-LOGIN-02 | ✅ |
| CRM_LOGIN_TC_050 | Medium | Yes | REQ-LOGIN-02, REQ-LOGIN-06, REQ-LOGIN-14 | ✅ |
| CRM_LOGIN_TC_041 | Low | Partial | REQ-LOGIN-06 | ✅ |
| CRM_LOGIN_TC_044 | Low | No | REQ-LOGIN-02 | ✅ |
| CRM_LOGIN_TC_048 | Low | Yes | REQ-LOGIN-02 | ✅ |

</details>

## 5. Kiểm tra khác

| Hạng mục | Số lượng | Kết quả |
|---|:-:|---|
| 🔴 REQ chưa có TC | 0 | ✅ Không có |
| 🟠 REQ chỉ có checklist | 0 | ✅ Không có — chưa có checklist nào cho module |
| ⚪ Orphan test (không map về REQ) | 0 | ✅ Không có — 20/20 TC có script đều có trong bộ TC, REQ khai trong `applyTcMeta()` khớp 100% cột `REQ ID` của TC |
| 🧩 TC trỏ tới REQ không tồn tại | 0 | ✅ Không có |
| 🗑️ Script trỏ vào TC Deprecated | 0 | ✅ Không có — bộ TC chưa có TC `@Deprecated` |
| ⚠️ Mapping suy luận cần xác nhận | 0 | ✅ Không có — 100% mapping theo ID |
| 📝 REQ lệch Story giữa index và file nền tảng | 1 | Xem bên dưới |

### 📝 REQ lệch Story giữa index và file nền tảng

| REQ ID | Index `REQUIREMENTS_LOGIN_SUMMARY.md` mục 10 | File `web/requirements_login_web.md` | Đề xuất |
|---|---|---|---|
| REQ-LOGIN-43 | STORY-LOGIN-03 (9 REQ) | Mục 3.4 — STORY-LOGIN-04 (bảng web cho STORY-03 có 8 REQ, STORY-04 có 9 REQ) | Chốt một Story rồi sửa nơi còn lại. Không ảnh hưởng chỉ số — chỉ đổi nhóm hiển thị |
