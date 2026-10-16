import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { CustomerLoginPage } from '../pages/customer-login.page';
import { DashboardPage } from '../pages/dashboard.page';

type Pages = {
  loginPage: LoginPage;
  customerLoginPage: CustomerLoginPage;
  dashboardPage: DashboardPage;
};

type AutoFixtures = {
  finalScreenshot: void;
};

export const test = base.extend<Pages & AutoFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  customerLoginPage: async ({ page }, use) => {
    await use(new CustomerLoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  // Ảnh trạng thái cuối cho MỌI test — PASS lẫn FAIL (reporting_rules.md mục 3)
  finalScreenshot: [
    async ({ page }, use, testInfo) => {
      await use();
      const name = testInfo.status === 'passed' ? 'trang_thai_cuoi_cua_test' : 'trang_thai_khi_that_bai';
      await testInfo.attach(name, {
        body: await page.screenshot({ fullPage: false }),
        contentType: 'image/png',
      });
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
