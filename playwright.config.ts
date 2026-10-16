import { defineConfig, devices } from '@playwright/test';
import { env } from './src/utils/env.config';

// Headed bị giới hạn bởi cửa sổ trình duyệt (xem CLAUDE.md > Browser Rules) — headless không vướng khung
const viewport = env.headless ? { width: 1920, height: 1080 } : { width: 1600, height: 770 };

export default defineConfig({
  testDir: './src/tests',
  timeout: env.timeout,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Parallel LUÔN bật — đổi số luồng ở .env (WORKERS), không sửa file này
  workers: env.workers,
  // Mọi output gom vào reports/ — xem reporting_rules.md mục 6
  outputDir: 'reports/test-artifacts',
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['list'],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
  ],
  use: {
    baseURL: env.baseURL,
    headless: env.headless,
    // 'off' vì ảnh được attach thủ công ở fixture cho CẢ pass lẫn fail
    screenshot: 'off',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
  },
  projects: [
    // viewport đặt SAU devices[...] — preset Desktop Chrome mang sẵn 1280×720 sẽ đè nếu đặt trước
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport } },
  ],
});
