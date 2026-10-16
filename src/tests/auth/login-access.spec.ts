import { test, expect } from '../../fixtures/base.fixture';
import { env } from '../../utils/env.config';
import { applyTcMeta, tcTitle } from '../../utils/report';
import { TestData } from '../../utils/test-data';
import loginData from '../../../test-data/login.json';

const invalidCredentials = loginData.messages.invalidCredentials;
const portal = loginData.customerPortal;

test.describe('Đăng nhập — Ranh giới khu quản trị và cổng khách hàng', () => {
  test(
    tcTitle('CRM_LOGIN_TC_019', 'Tài khoản khách hàng hợp lệ bị từ chối ở khu quản trị mà không lộ ra rằng email đó có tài khoản'),
    { tag: ['@regression', '@security', '@permission', '@techcheck', '@authenticated', '@login'] },
    async ({ page, loginPage, customerLoginPage }) => {
      const customer = env.customer;
      test.skip(!customer, 'Thiếu CUSTOMER_EMAIL / CUSTOMER_PASSWORD trong .env');
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_019',
        requirements: ['REQ-LOGIN-43', 'REQ-LOGIN-15'],
        priority: 'High',
        description: 'Tài khoản khách hàng hợp lệ bị từ chối ở /admin/authentication với thông báo chung; cùng cặp đó đăng nhập '
          + 'được ở cổng khách hàng /login; và kết quả bị từ chối giống hệt một email không tồn tại.',
      });
      const adminLoginUrl = `${env.baseURL}${loginPage.path}`;

      await test.step('Arrange: Mở trang đăng nhập khu quản trị', async () => {
        await loginPage.open();
      });

      await test.step('Act 1: Gửi cặp thông tin Customer ở khu quản trị', async () => {
        await loginPage.login(customer!.email, customer!.password);
      });

      const customerOutcome = await test.step('Assert 1: Bị từ chối — đúng 1 dải báo lỗi chung, không tạo phiên quản trị', async () => {
        await expect(loginPage.errorAlerts, 'Phải có đúng 1 dải báo lỗi chung').toHaveText([invalidCredentials]);
        await expect(page, 'Phải ở lại trang đăng nhập khu quản trị').toHaveURL(adminLoginUrl);
        return { messages: await loginPage.errorMessages(), url: page.url() };
      });

      await test.step('Act 2: Đăng nhập đúng cặp đó ở cổng khách hàng /login', async () => {
        await customerLoginPage.open();
        await customerLoginPage.login(customer!.email, customer!.password);
      });

      await test.step('Assert 2: Cổng khách hàng đăng nhập thành công — loại trừ khả năng sai mật khẩu', async () => {
        await expect(page, 'Phải dừng ở trang chủ cổng khách hàng').toHaveURL(`${env.baseURL}${portal.homePath}`);
        await expect(page, `Tiêu đề tab phải là "${portal.titleAfterLogin}"`).toHaveTitle(portal.titleAfterLogin);
      });

      await test.step('Act 3: Quay lại khu quản trị, gửi email không tồn tại', async () => {
        await loginPage.open();
        await loginPage.login(TestData.email('tc019'), loginData.anyPassword);
      });

      const unknownOutcome = await test.step('Assert 3: Đúng 1 dải báo lỗi chung, ở lại trang đăng nhập', async () => {
        await expect(loginPage.errorAlerts, 'Phải có đúng 1 dải báo lỗi chung').toHaveText([invalidCredentials]);
        await expect(page, 'Phải ở lại trang đăng nhập khu quản trị').toHaveURL(adminLoginUrl);
        return { messages: await loginPage.errorMessages(), url: page.url() };
      });

      await test.step('Assert 4: Kết quả bước 1 và bước 3 giống hệt nhau', async () => {
        expect(unknownOutcome, 'Không được lộ ra rằng email khách hàng có tài khoản').toEqual(customerOutcome);
      });
    },
  );

  test(
    tcTitle('CRM_LOGIN_TC_020', 'Đang có phiên cổng khách hàng hợp lệ vẫn không mở được URL nội bộ khu quản trị'),
    { tag: ['@regression', '@security', '@permission', '@authenticated', '@login'] },
    async ({ page, loginPage, customerLoginPage }) => {
      const customer = env.customer;
      test.skip(!customer, 'Thiếu CUSTOMER_EMAIL / CUSTOMER_PASSWORD trong .env');
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_020',
        requirements: ['REQ-LOGIN-43'],
        priority: 'High',
        description: `Đang đăng nhập ở cổng khách hàng mà gõ thẳng ${portal.adminInternalPath} thì bị đưa về trang đăng nhập `
          + 'khu quản trị, không thấy dữ liệu nghiệp vụ nào.',
      });

      await test.step('Arrange: Đăng nhập cổng khách hàng, xác nhận phiên đang hoạt động', async () => {
        await customerLoginPage.open();
        await customerLoginPage.login(customer!.email, customer!.password);
        await expect(page, 'Phiên cổng khách hàng phải đang hoạt động').toHaveTitle(portal.titleAfterLogin);
      });

      await test.step(`Act: Gõ thẳng ${portal.adminInternalPath} vào thanh địa chỉ`, async () => {
        await loginPage.gotoPath(portal.adminInternalPath);
      });

      await test.step('Assert: Bị đưa về trang đăng nhập khu quản trị, không thấy dữ liệu nghiệp vụ', async () => {
        await expect(page, 'Phải bị chuyển về trang đăng nhập khu quản trị').toHaveURL(`${env.baseURL}${loginPage.path}`);
        await expect(loginPage.formHeading, 'Phải hiển thị biểu mẫu đăng nhập khu quản trị').toBeVisible();
      });
    },
  );
});
