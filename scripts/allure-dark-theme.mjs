// Ép Allure 3 (plugin awesome) mở ở chế độ tối mặc định.
// Lý do: allure 3.20.1 nhúng `theme` của allurerc.mjs vào trang nhưng giao diện vẫn khởi tạo "auto"
// (theo hệ điều hành) — đã kiểm chứng 12-10-2026. Script đặt sẵn localStorage.theme = "dark" trước khi app chạy,
// chỉ khi người xem chưa tự chọn theme, nên nút chuyển sáng/tối trong report vẫn hoạt động bình thường.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const reportDir = process.argv[2] ?? 'reports/allure-report';
const indexFile = resolve(reportDir, 'index.html');
const marker = 'data-allure-dark-default';
const snippet = `<script ${marker}>try{var t=localStorage.getItem("theme");`
  + `if(t===null||t==="auto"||t==="\\"auto\\""){localStorage.setItem("theme","dark")}}catch(e){}</script>`;

const html = readFileSync(indexFile, 'utf8');
if (html.includes(marker)) process.exit(0);
writeFileSync(indexFile, html.replace(/<head([^>]*)>/i, `<head$1>${snippet}`), 'utf8');
