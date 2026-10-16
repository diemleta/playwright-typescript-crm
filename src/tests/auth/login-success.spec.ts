import * as allure from 'allure-js-commons';
import { test, expect } from '../../fixtures/base.fixture';
import { env } from '../../utils/env.config';
import { applyTcMeta, tcTitle } from '../../utils/report';
import { TestData } from '../../utils/test-data';
import loginData from '../../../test-data/login.json';

const dashboard = loginData.dashboard;
const dashboardUrl = `${env.baseURL}${dashboard.path}`;
const autologin = loginData.autologinCookie;

test.describe('Đăng nhập — Đăng nhập thành công', () => {
  test(
    tcTitle('CRM_LOGIN_TC_005', 'Đăng nhập bằng tài khoản Admin hợp lệ thì vào được Dashboard'),
    { tag: ['@smoke', '@criticalpath', '@techcheck', '@authenticated', '@login'] },
    async ({ page, loginPage, dashboardPage }) => {
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_005',
        requirements: ['REQ-LOGIN-06'],
        priority: 'Critical',
        description: 'Đăng nhập bằng tài khoản Admin hợp lệ, không tích Remember me, thì chuyển vào /admin/ với tiêu đề Dashboard, '
          + 'thấy menu điều hướng bên trái và ảnh đại diện góc trên bên phải.',
      });

      await test.step('Arrange: Mở trang đăng nhập, chưa có phiên', async () => {
        await loginPage.open();
      });

      await test.step('Act: Nhập tài khoản Admin, để trống Remember me, bấm Login', async () => {
        await loginPage.login(env.username, env.password);
      });

      await test.step('Assert: Không hiện dải báo lỗi, dừng ở /admin/', async () => {
        await expect(page, `Phải chuyển vào ${dashboardUrl}`).toHaveURL(dashboardUrl);
        await expect(dashboardPage.errorAlerts, 'Không được có dải báo lỗi đỏ').toHaveCount(0);
      });

      await test.step(`Assert: Tab trình duyệt có chữ "${dashboard.titleContains}"`, async () => {
        await expect(page, 'Tiêu đề tab phải chứa Dashboard').toHaveTitle(new RegExp(dashboard.titleContains));
      });

      await test.step('Assert: Hiện menu điều hướng bên trái và ảnh đại diện góc trên bên phải', async () => {
        await expect(dashboardPage.sideMenu, 'Menu điều hướng bên trái phải hiển thị').toBeVisible();
        await expect(dashboardPage.userAvatar, 'Ảnh đại diện góc trên bên phải phải hiển thị').toBeVisible();
      });

      await test.step('Assert: body mang đủ class của Dashboard Admin (ghi chú kỹ thuật)', async () => {
        for (const cssClass of dashboard.adminBodyClasses) {
          await expect(dashboardPage.body, `body phải mang class ${cssClass}`).toContainClass(cssClass);
        }
      });
    },
  );

  test(
    tcTitle('CRM_LOGIN_TC_006', 'Đăng nhập bằng tài khoản Project Manager thì vào Dashboard với bộ menu rút gọn'),
    { tag: ['@regression', '@permission', '@techcheck', '@authenticated', '@login'] },
    async ({ page, loginPage, dashboardPage }) => {
      const account = env.projectManager;
      test.skip(!account, 'Thiếu PM_EMAIL / PM_PASSWORD trong .env');
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_006',
        requirements: ['REQ-LOGIN-06'],
        priority: 'High',
        description: `Đăng nhập bằng Project Manager thì vào /admin/ với menu trái đúng ${dashboard.projectManagerMenuCount} mục `
          + 'và không có các mục quản trị dành riêng cho Admin.',
      });

      await test.step('Arrange: Mở trang đăng nhập', async () => {
        await loginPage.open();
      });

      await test.step('Act: Đăng nhập bằng tài khoản Project Manager', async () => {
        await loginPage.login(account!.email, account!.password);
      });

      await test.step('Assert: Đăng nhập thành công, dừng ở /admin/', async () => {
        await expect(page, `Phải chuyển vào ${dashboardUrl}`).toHaveURL(dashboardUrl);
        await expect(dashboardPage.errorAlerts, 'Không được có dải báo lỗi đỏ').toHaveCount(0);
      });

      await test.step(`Assert: Menu trái có đúng ${dashboard.projectManagerMenuCount} mục`, async () => {
        await expect(dashboardPage.sideMenuItems, 'Số mục menu của Project Manager')
          .toHaveCount(dashboard.projectManagerMenuCount);
      });

      await test.step('Assert: Không có mục nào dành riêng cho Admin', async () => {
        for (const item of dashboard.itemsHiddenFromProjectManager) {
          await expect(dashboardPage.sideMenuItem(item), `Project Manager không được thấy mục "${item}"`).toHaveCount(0);
        }
      });

      await test.step('Assert: body mang class của Project Manager (ghi chú kỹ thuật)', async () => {
        await expect(dashboardPage.body, `body phải mang class ${dashboard.projectManagerBodyClass}`)
          .toContainClass(dashboard.projectManagerBodyClass);
      });
    },
  );

  for (const data of loginData.emailNormalizationVariants) {
    test(
      tcTitle('CRM_LOGIN_TC_007', `Email được chuẩn hoá — khác kiểu chữ và thừa khoảng trắng vẫn đăng nhập được (${data.label})`, data.variant),
      { tag: ['@regression', '@boundary', '@authenticated', '@login'] },
      async ({ page, loginPage, dashboardPage }) => {
        await applyTcMeta({
          tcId: 'CRM_LOGIN_TC_007',
          variant: data.variant,
          requirements: ['REQ-LOGIN-07', 'REQ-LOGIN-38'],
          priority: 'High',
          description: `Biến thể ${data.variant} — ${data.label}: email Admin viết khác kiểu chữ / thừa khoảng trắng `
            + 'vẫn đăng nhập thành công vào Dashboard.'
            + (data.sendRaw
              ? ' Ô Email type="email" tự cắt khoảng trắng ở trình duyệt, nên test đổi ô sang type="text" để chuỗi '
                + 'có khoảng trắng tới máy chủ nguyên văn — đây là phép thử phía máy chủ.'
              : ''),
        });
        const email = TestData.transformEmail(env.username, data.transform);
        const submittedEmails = loginPage.recordLoginSubmissions();

        await test.step('Arrange: Mở trang đăng nhập', async () => {
          await loginPage.open();
          if (data.sendRaw) {
            await loginPage.disableBrowserEmailSanitizing();
          }
        });

        await test.step(`Act: Đăng nhập bằng email biến thể "${email}"`, async () => {
          await loginPage.login(email, env.password);
        });

        await test.step('Assert: Máy chủ nhận đúng nguyên chuỗi email của biến thể', async () => {
          expect(
            submittedEmails,
            'Chuỗi email gửi lên phải giữ nguyên biến thể (kể cả khoảng trắng) — nếu không, test không kiểm được máy chủ',
          ).toEqual([email]);
        });

        await test.step('Assert: Không hiện "Invalid email or password", vào Dashboard', async () => {
          await expect(dashboardPage.errorAlerts, 'Không được có dải báo lỗi').toHaveCount(0);
          await expect(page, `Phải chuyển vào ${dashboardUrl}`).toHaveURL(dashboardUrl);
          await expect(page, 'Tiêu đề tab phải chứa Dashboard').toHaveTitle(new RegExp(dashboard.titleContains));
        });
      },
    );
  }

  test(
    tcTitle('CRM_LOGIN_TC_008', 'Tích Ghi nhớ đăng nhập thì hệ thống phát hành cookie ghi nhớ'),
    { tag: ['@regression', '@security', '@techcheck', '@authenticated', '@login'] },
    async ({ page, loginPage }) => {
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_008',
        requirements: ['REQ-LOGIN-08'],
        priority: 'High',
        description: 'Từ trạng thái không có cookie, tích Remember me rồi đăng nhập thì có cookie autologin đúng hình thái '
          + '(key 16 ký tự hex). Chỉ kiểm hình thái — không ghi giá trị cookie vào report.',
      });

      await test.step('Arrange: Context sạch, chưa có cookie nào', async () => {
        expect(await page.context().cookies(), 'Trước khi đăng nhập danh sách cookie phải rỗng').toHaveLength(0);
        await loginPage.open();
      });

      await test.step('Act: Nhập tài khoản Admin, tích Remember me', async () => {
        await loginPage.fillCredentials(env.username, env.password);
        await loginPage.rememberCheckbox.check();
      });

      await test.step('Assert: Ô Remember me đã tích', async () => {
        await expect(loginPage.rememberCheckbox, 'Remember me phải đang tích').toBeChecked();
      });

      await test.step('Act: Bấm Login', async () => {
        await loginPage.submit();
      });

      await test.step('Assert: Đăng nhập thành công, dừng ở /admin/', async () => {
        await expect(page, `Phải chuyển vào ${dashboardUrl}`).toHaveURL(dashboardUrl);
      });

      await test.step(`Assert: Có cookie ${autologin.name} đúng hình thái (ghi chú kỹ thuật)`, async () => {
        const cookie = (await page.context().cookies()).find((c) => c.name === autologin.name);
        expect(cookie, `Phải tồn tại cookie ${autologin.name}`).toBeDefined();
        // So khớp bằng boolean để giá trị cookie thật KHÔNG lọt vào message lỗi của report
        const matchesShape = new RegExp(autologin.pattern).test(decodeURIComponent(cookie!.value));
        expect(matchesShape, `Cookie ${autologin.name} phải đúng hình thái user_id + key 16 ký tự hex`).toBe(true);
      });
    },
  );

  test(
    tcTitle('CRM_LOGIN_TC_009', 'Không tích Ghi nhớ đăng nhập thì hoàn toàn không phát hành cookie ghi nhớ'),
    { tag: ['@regression', '@security', '@techcheck', '@authenticated', '@login'] },
    async ({ page, loginPage }) => {
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_009',
        requirements: ['REQ-LOGIN-09'],
        priority: 'High',
        description: 'Từ trạng thái sạch (không cookie, không phiên), đăng nhập với Remember me để trống thì sau khi vào '
          + `/admin/ hoàn toàn không có cookie ${autologin.name}.`,
      });

      await test.step('Arrange: Context sạch, mở trang đăng nhập, Remember me đang rỗng', async () => {
        expect(await page.context().cookies(), 'Trước khi đăng nhập danh sách cookie phải rỗng').toHaveLength(0);
        await loginPage.open();
        await expect(loginPage.rememberCheckbox, 'Remember me phải đang rỗng').not.toBeChecked();
      });

      await test.step('Act: Đăng nhập Admin, không động vào ô Remember me', async () => {
        await loginPage.login(env.username, env.password);
      });

      await test.step('Assert: Đăng nhập thành công, dừng ở /admin/', async () => {
        await expect(page, `Phải chuyển vào ${dashboardUrl}`).toHaveURL(dashboardUrl);
      });

      await test.step(`Assert: Không tồn tại cookie ${autologin.name} (ghi chú kỹ thuật)`, async () => {
        const names = (await page.context().cookies()).map((c) => c.name);
        expect(names, `Không được phát hành cookie ${autologin.name}`).not.toContain(autologin.name);
      });
    },
  );

  test(
    tcTitle('CRM_LOGIN_TC_010', 'Bấm nút Login hai lần liên tiếp vẫn vào đúng Dashboard, không sinh trang lỗi'),
    { tag: ['@regression', '@racecondition', '@authenticated', '@login'] },
    async ({ page, loginPage, dashboardPage }) => {
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_010',
        requirements: ['REQ-LOGIN-06'],
        priority: 'Medium',
        description: 'Nhập đúng tài khoản Admin rồi bấm Login hai lần liên tiếp thật nhanh thì vẫn vào Dashboard, '
          + 'không có dải báo lỗi và không xuất hiện trang 419 Page Expired. Giới hạn: Chromium gộp hai lần bấm trên '
          + 'cùng một trang thành một request — test kiểm hành vi người dùng double-click, KHÔNG kiểm hai request '
          + 'đăng nhập gửi đồng thời tới máy chủ. Số request thực tế ghi ở tham số "Số lần gửi đăng nhập thực tế".',
      });
      const submissions = loginPage.recordLoginSubmissions();

      await test.step('Arrange: Mở trang đăng nhập, nhập tài khoản Admin', async () => {
        await loginPage.open();
        await loginPage.fillCredentials(env.username, env.password);
      });

      await test.step('Act: Bấm Login hai lần liên tiếp', async () => {
        await loginPage.submitTwiceQuickly();
      });

      await test.step('Assert: Ghi nhận số lần gửi đăng nhập thực sự tới máy chủ', async () => {
        expect(submissions.length, 'Phải có ít nhất 1 request đăng nhập được gửi đi').toBeGreaterThanOrEqual(1);
        await allure.parameter('Số lần gửi đăng nhập thực tế', String(submissions.length));
      });

      await test.step('Assert: Dừng ở Dashboard, không dải báo lỗi', async () => {
        await expect(page, `Phải dừng ở ${dashboardUrl}`).toHaveURL(dashboardUrl);
        await expect(page, 'Tiêu đề tab phải chứa Dashboard').toHaveTitle(new RegExp(dashboard.titleContains));
        await expect(dashboardPage.errorAlerts, 'Không được có dải báo lỗi đỏ').toHaveCount(0);
      });

      await test.step('Assert: Không xuất hiện "419 Page Expired!"', async () => {
        await expect(dashboardPage.body, 'Không được rơi vào trang 419').not.toContainText('419 Page Expired!');
      });
    },
  );
});
