# Perfex CRM — Automation Framework (Playwright + TypeScript)

Bộ test automation web cho Perfex CRM (`https://crm.anhtester.com`), mô hình Page Object Model, report Allure, chạy song song mặc định 5 luồng.

## Yêu cầu máy

| Công cụ | Phiên bản |
|---|---|
| Node.js | 20 trở lên (đã kiểm trên 24) |

Không cần cài Allure hay Java lên máy — Allure 3 nằm trong `devDependencies`.

## Cài đặt

```bash
npm install
npx playwright install chromium
cp .env.example .env      # rồi điền giá trị thật vào .env
```

| Biến `.env` | Ý nghĩa |
|---|---|
| `BASE_URL` | Gốc hệ thống, VD `https://crm.anhtester.com` |
| `TEST_USERNAME` / `TEST_PASSWORD` | Tài khoản Admin — chỉ đọc khi test cần đăng nhập |
| `PM_EMAIL` / `PM_PASSWORD` | Tài khoản Project Manager — thiếu thì `CRM_LOGIN_TC_006` tự skip |
| `CUSTOMER_EMAIL` / `CUSTOMER_PASSWORD` | Tài khoản cổng khách hàng — thiếu thì `CRM_LOGIN_TC_019`, `020` tự skip |
| `TC014_EMAIL` / `TC014_PASSWORD` | Staff có mật khẩu chứa chữ cái — thiếu thì `CRM_LOGIN_TC_014` tự skip |
| `HEADLESS` | `false` = mở browser thật (debug) · `true` = headless (CI) |
| `WORKERS` | Số luồng song song — **chỉnh duy nhất ở đây** |
| `TIMEOUT` | Timeout mỗi test (ms) |

`.env` đã nằm trong `.gitignore` — **không** commit credentials.

## Chạy test

```bash
npm test                          # toàn bộ, theo HEADLESS trong .env
npm run test:headed               # ép mở browser thật
npm run test:smoke                # chỉ test gắn @smoke
npx playwright test --grep CRM_LOGIN_TC_001
npx playwright test --grep @authenticated          # chỉ test đăng nhập bằng tài khoản thật
npx playwright test --grep-invert @authenticated   # test không cần tài khoản thật
```

| Tag | Ý nghĩa |
|---|---|
| `@authenticated` | Test đăng nhập thành công bằng tài khoản thật trong `.env` |
| `@knownbug` | Test đang phơi bug đã mở — dùng `test.fail()`: FAIL đúng kỳ vọng thì suite vẫn xanh; bug được fix thì test báo đỏ để gỡ đánh dấu. Allure có link sang file bug trong `docs/bugs/` |

**Đổi số luồng:** sửa `WORKERS` trong `.env`, hoặc một lần chạy: `npx cross-env WORKERS=2 playwright test`.

Viewport: headed `1600×770` (vừa cửa sổ trên màn 1920×1080), headless `1920×1080` — tự chọn theo `HEADLESS`.

## Mở report

```bash
npm run report         # sinh + mở Allure (reports/allure-report)
npm run report:html    # mở HTML report của Playwright (reports/html)
```

`npm run report:generate` chỉ sinh report, không mở. Lệnh này xoá `reports/allure-report/` trước khi sinh, vì Allure 3 **không ghi đè** report cũ và cũng không báo lỗi.

**Report mở ở nền tối mặc định.** Cấu hình gồm 2 phần:
- `allurerc.mjs` có `theme: "dark"`. Allure 3.20.1 nhúng giá trị này vào trang nhưng giao diện vẫn khởi tạo `auto` (theo hệ điều hành).
- Sau khi sinh, `scripts/allure-dark-theme.mjs` chèn một đoạn script vào `index.html` để đặt sẵn `localStorage.theme = "dark"`. Đoạn này chỉ ghi khi người xem chưa tự chọn, nên nút chuyển sáng/tối trong report vẫn dùng bình thường và lựa chọn của người xem được giữ.
- Muốn bỏ nền tối mặc định: xoá `&& node scripts/allure-dark-theme.mjs` khỏi script `report:generate` trong `package.json`, và đổi `theme` trong `allurerc.mjs` về `"auto"`.

**Report mở ở layout 2 khung**: trái là danh sách test, phải là chi tiết test đang chọn. Cấu hình bằng `layout: "split"` trong `allurerc.mjs` (đổi `"base"` để về 1 khung). Khác với theme, giá trị này có hiệu lực ngay, không cần script phụ. Nút chuyển layout ở góc trên phải report vẫn dùng được; lựa chọn của người xem được lưu lại trên trình duyệt đó và được ưu tiên hơn config.

Gửi report cho người không có Node: đổi `singleFile: true` trong `allurerc.mjs`, chạy `npx allure generate reports/allure-results`, gửi file `index.html` trong `reports/allure-report`.

Toàn bộ output nằm trong `reports/` (đã `.gitignore`): `allure-results/` · `allure-report/` · `html/` · `logs/` · `test-artifacts/` (video/trace khi fail).

## Cấu trúc

```text
├── playwright.config.ts      # parallel, reporter, viewport, output → reports/
├── allurerc.mjs              # output Allure 3
├── .env.example
├── src/
│   ├── pages/                # Page Object — base · auth-form (form đăng nhập chung) · login · customer-login · dashboard
│   ├── fixtures/             # base.fixture.ts — inject page object + ảnh cuối mọi test
│   ├── utils/                # env.config.ts · logger.ts · test-data.ts · report.ts (metadata Allure, TC ID)
│   └── tests/auth/           # login · login-validation · login-success · login-access
├── test-data/                # dữ liệu kỳ vọng / data-driven (JSON)
└── .github/workflows/        # playwright.yml — CI headless + parallel
```

## Quy ước viết test

- Tên test bắt đầu bằng TC ID — dùng `tcTitle(tcId, tên, biếnThể?)` → `CRM_LOGIN_TC_011-a - <mô tả>`; metadata gắn bằng `applyTcMeta({ tcId, requirements, priority, description, variant })` (gọi `label('testId')` đầu tiên, map Priority → Severity: Critical→critical · High→normal · Medium→minor · Low→trivial); tag gắn bằng `{ tag: ['@smoke', ...] }`.
- Thân test chia step `Arrange:` / `Act:` / `Assert:`; method POM tự bọc `test.step` để sinh sub-step.
- Locator chỉ khai trong Page class, ưu tiên `getByRole` / `getByLabel`; phải verify trên DOM thật trước khi dùng.
- Không `waitForTimeout`, không `console.log` (dùng `logger` → `reports/logs/`).
- Ảnh cuối test được fixture `finalScreenshot` tự đính kèm — không chụp trong thân test.
- Dữ liệu unique sinh bằng `TestData` (timestamp + random) để chạy song song không đá nhau.

## CI

`.github/workflows/playwright.yml` chạy khi push `main`, pull request, hoặc chạy tay. Khai 3 GitHub Secrets: `BASE_URL`, `TEST_USERNAME`, `TEST_PASSWORD`. Số luồng CI đổi ở `env.WORKERS` của workflow (runner `ubuntu-latest`: repo public 4 vCPU, repo private 2 vCPU — repo private nên hạ xuống 2–3 nếu chập chờn). Report upload thành artifact `test-reports`.

**Xem report trực tiếp trên GitHub Pages:** mỗi lần chạy trên `main` (push, lịch hằng ngày, chạy tay — không tính pull request), job `deploy-report` đăng `reports/allure-report` lên `https://diemleta.github.io/playwright-typescript-crm/`, kể cả khi test FAIL. Trang chỉ giữ report của **lần chạy gần nhất**. Bật một lần: **Settings → Pages → Build and deployment → Source: GitHub Actions** (repo private cần gói GitHub Pro trở lên). Trang Pages công khai với mọi người có link, nên bản đăng đã bỏ trace (`.zip`); video và ảnh vẫn còn.

**Báo kết quả vào group Telegram:** sau `deploy-report`, job `notify` gửi một tin nhắn gồm số PASS/FAIL/SKIP, danh sách test lỗi, link Allure report và link run (cùng điều kiện chạy với `deploy-report`). Script: `scripts/telegram-notify.mjs`, chạy thử ở máy bằng `node scripts/telegram-notify.mjs reports/allure-report --dry-run`. Thiết lập một lần:

1. Tạo bot với [@BotFather](https://t.me/BotFather) (`/newbot`) → lấy token.
2. Thêm bot vào group, gửi một tin bất kỳ trong group, rồi mở `https://api.telegram.org/bot<TOKEN>/getUpdates` → lấy `chat.id` (group có dạng `-100…`).
3. Khai GitHub Secrets `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. Group bật Topics thì khai thêm Variable `TELEGRAM_THREAD_ID` (id topic).

Thiếu secret thì job chỉ cảnh báo và bỏ qua, không làm đỏ CI. Không gửi kèm file report vì bản 1 file nặng hơn 100MB, vượt giới hạn 50MB của Telegram Bot API.

Workflow **không** truyền tài khoản tuỳ chọn (`PM_*`, `CUSTOMER_*`, `TC014_*`) nên trên CI `CRM_LOGIN_TC_006`, `014`, `019`, `020` tự skip. Muốn chạy thì thêm Secret và khai thêm vào bước `Run tests` — lưu ý `019`, `020` chập chờn theo dữ liệu dùng chung (xem Known issues).

⚠️ Artifact `test-reports` chứa video và trace của test fail — trace ghi lại cả giá trị đã gõ vào ô Password. Chỉ dùng tài khoản test, và cân nhắc để repo private.

⚠️ `docs/` chứa ảnh và video chụp hệ thống thật (`docs/**/evidence/`, `docs/user-guides/*/images|video/`). Rà lại trước khi đẩy lên repo public.

## Test đã automate

| TC ID | Tên | File |
|---|---|---|
| `CRM_LOGIN_TC_001` → `004` | Giao diện & cấu trúc trang đăng nhập | `src/tests/auth/login.spec.ts` |
| `CRM_LOGIN_TC_011` → `018` | Kiểm tra dữ liệu nhập & bảo mật (`015` đăng nhập bằng tài khoản Admin thật — tag `@authenticated`) | `src/tests/auth/login-validation.spec.ts` |
| `CRM_LOGIN_TC_005` → `010` | Đăng nhập thành công | `src/tests/auth/login-success.spec.ts` |
| `CRM_LOGIN_TC_019`, `020` | Ranh giới khu quản trị ↔ cổng khách hàng | `src/tests/auth/login-access.spec.ts` |

**Known issues**
- `CRM_LOGIN_TC_004`, `016` — phơi bug đang mở (`@knownbug`).
- `CRM_LOGIN_TC_014` — tự skip khi `.env` chưa khai `TC014_EMAIL` / `TC014_PASSWORD` (tài khoản demo chỉ có mật khẩu số — RISK-LOGIN-07).
- `CRM_LOGIN_TC_019`, `020` — chập chờn theo dữ liệu môi trường dùng chung: tiêu đề cổng khách hàng là tên công ty của tài khoản `customer@example.com`, mà tên này bị người khác sửa qua lại (`Customer Example` ↔ `HKD Anh Tester`). TC kỳ vọng `HKD Anh Tester` — FAIL ngày 16-10-2026 lúc 08:36, PASS ở lần chạy sau đó cùng ngày (tài khoản trong `.env` không đổi). Cần tài khoản khách hàng riêng hoặc bỏ phụ thuộc vào tên công ty.
- `CRM_LOGIN_TC_007-c/d` — ô Email `type="email"` nên trình duyệt tự cắt khoảng trắng trước khi gửi; hai biến thể này chưa chứng minh được việc cắt khoảng trắng ở phía máy chủ.
