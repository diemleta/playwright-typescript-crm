---
name: tc-id-in-test-title
description: "Mọi test script sinh ra phải có TC ID đứng đầu tên test (`<TC ID> - <mô tả>`) VÀ giữ label testId gọi sớm"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 93a51840-e4ae-4a03-a9af-52f7644e094b
  modified: 2026-10-12T07:18:39.921Z
---

Khi sinh automation script (mọi stack: Playwright TS, Pytest, TestNG...), tên test hiển thị trong report PHẢI có dạng `<TC ID> - <mô tả hành vi Tiếng Việt>`, ví dụ `CRM_LOGIN_TC_001 - Mở trang đăng nhập khi chưa có phiên thì thấy biểu mẫu đăng nhập`. Biến thể a/b/c ghi `CRM_LOGIN_TC_011-a - <mô tả>`. Đồng thời VẪN giữ label `testId` (cho RTM).

**Why:** User mở Allure report lần đầu không thấy TC ID — Allure 3 (giao diện Awesome) chỉ hiện label trong mục Labels ở trang chi tiết test, và chỉ 8 nhóm label đầu, phần sau bị ẩn sau "Show more"; `testId` lẫn giữa label kỹ thuật (language/framework/package). User chốt quy ước này trong `.claude/rules/reporting_rules.md` mục 1 (12-10-2026) và yêu cầu ghi nhớ cho mọi lần code sau.

**How to apply:**
- Khai TC ID **một lần** rồi dùng cho cả title lẫn `label('testId')` — không gõ mã hai lần (review 12-10-2026 bắt lỗi này ở 20 test). Ở project này: `tcTitle()` + `applyTcMeta()` trong `src/utils/report.ts`.
- Gọi `label('testId')` ngay dòng đầu thân test, trước severity/các label khác, để nằm trong 8 nhóm được hiện.
- Gắn metadata **trước** `test.skip()` — gọi sau thì test bị skip mất hết testId/severity trong Allure (đã đo trên TC_014).
- Code mẫu ở `.claude/skills/skills-framework-architect/references/CODE_TEMPLATES.md` § 7 đã theo quy ước này.

Liên quan: [allure-dark-mode-default](../allure-report/allure-dark-mode-default.md), [allure-split-layout-default](../allure-report/allure-split-layout-default.md).
