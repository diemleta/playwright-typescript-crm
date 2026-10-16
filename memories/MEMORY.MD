# MEMORY — Quy ước bắt buộc cho mọi lần sinh / sửa automation code

> Index của thư mục `memories/`: mỗi file con là **một** quy ước, có phần **Why** (vì sao, đã kiểm chứng thế nào) và **How to apply** (áp ra sao).
> Agent đọc file này trước khi sinh/sửa test script hoặc cấu hình report. Được trỏ tới từ `CLAUDE.md`.
> Thêm quy ước mới: tạo file trong đúng thư mục con, rồi thêm 1 dòng vào bảng bên dưới.

## `automation-code/` — quy ước viết test script

| Quy ước | File | Tóm tắt |
|---|---|---|
| TC ID ở đầu tên test | [tc-id-in-test-title.md](automation-code/tc-id-in-test-title.md) | Tên test `<TC ID> - <mô tả>`, khai TC ID một lần, `testId` gọi sớm và **trước** `test.skip` |

## `allure-report/` — cấu hình report Allure mặc định

| Quy ước | File | Tóm tắt |
|---|---|---|
| Report mở ở dark mode | [allure-dark-mode-default.md](allure-report/allure-dark-mode-default.md) | Allure 3.20.1: `theme: "dark"` KHÔNG đủ, cần script chèn `localStorage` sau `allure generate` |
| Report mở ở layout split | [allure-split-layout-default.md](allure-report/allure-split-layout-default.md) | `layout: "split"` trong `allurerc.mjs` là đủ: trái danh sách test, phải chi tiết |
| `allure generate` không ghi đè | [allure-generate-no-overwrite.md](allure-report/allure-generate-no-overwrite.md) | Phải xoá output trước khi sinh, nếu không sẽ mở report cũ. Hai quy ước trên phụ thuộc vào quy ước này |

## Liên kết giữa các quy ước

```
automation-code/tc-id-in-test-title ──┐
                                      ├── cùng phục vụ report Allure dễ đọc
allure-report/allure-dark-mode-default ─┤
allure-report/allure-split-layout-default ┘
        │
        └── cả hai cần ──► allure-report/allure-generate-no-overwrite
```
