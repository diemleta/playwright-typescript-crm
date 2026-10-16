import { defineConfig } from "allure";

export default defineConfig({
  name: "Perfex CRM — Automation Report",
  output: "reports/allure-report",
  plugins: {
    awesome: {
      options: {
        singleFile: false,
        reportLanguage: "en",
        // Allure 3.20.1 nhúng giá trị này nhưng giao diện vẫn khởi tạo "auto" → scripts/allure-dark-theme.mjs ép mặc định tối
        theme: "dark",
        // "split" = 2 khung: trái danh sách test, phải chi tiết test đang chọn ("base" = 1 khung)
        layout: "split",
      },
    },
  },
});
