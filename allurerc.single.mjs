// Bản report 1 file HTML — mở bằng double-click (file://) được, tiện gửi qua chat/email.
// Bản nhiều file (allurerc.mjs) tải data/*.json bằng fetch nên trình duyệt chặn khi mở qua file://.
import { defineConfig } from "allure";
import base from "./allurerc.mjs";

export default defineConfig({
  ...base,
  output: "reports/allure-report-single",
  plugins: {
    awesome: {
      options: {
        ...base.plugins.awesome.options,
        singleFile: true,
      },
    },
  },
});
