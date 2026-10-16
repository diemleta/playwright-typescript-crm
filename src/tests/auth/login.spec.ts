import { test, expect } from '../../fixtures/base.fixture';
import { env } from '../../utils/env.config';
import { applyTcMeta, markKnownBug, tcTitle } from '../../utils/report';
import loginData from '../../../test-data/login.json';

const ui = loginData.loginPage;

test.describe('Đăng nhập — Giao diện & cấu trúc trang', () => {
  test(
    tcTitle('CRM_LOGIN_TC_001', 'Mở trang đăng nhập khi chưa có phiên thì thấy biểu mẫu đăng nhập'),
    { tag: ['@smoke', '@criticalpath', '@techcheck', '@login'] },
    async ({ page, loginPage }) => {
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_001',
        requirements: ['REQ-LOGIN-01'],
        priority: 'Critical',
        description: 'Kiểm tra người dùng chưa đăng nhập mở /admin/authentication thì trang tải thành công (HTTP 200), '
          + 'URL giữ nguyên, tab trình duyệt và tiêu đề khối biểu mẫu hiển thị đúng trang Login.',
      });
      const expectedUrl = `${env.baseURL}${loginPage.path}`;

      await test.step('Arrange: Trình duyệt sạch, chưa có cookie phiên đăng nhập', async () => {
        expect(await page.context().cookies(), 'Context mới phải chưa có cookie nào').toHaveLength(0);
      });

      const response = await test.step('Act: Mở trang đăng nhập', async () => loginPage.open());

      await test.step('Assert: Trang tải thành công, không phải trang lỗi', async () => {
        expect(response?.status(), `Trang đăng nhập phải trả HTTP ${ui.expectedHttpStatus}`).toBe(ui.expectedHttpStatus);
      });

      await test.step('Assert: Thanh địa chỉ dừng đúng ở trang đăng nhập, không bị chuyển hướng', async () => {
        await expect(page, `URL phải giữ nguyên ${expectedUrl}`).toHaveURL(expectedUrl);
      });

      await test.step(`Assert: Tab trình duyệt ghi "${ui.expectedTabTitle}"`, async () => {
        await expect(page, 'Tiêu đề tab trình duyệt phải đúng trang Login').toHaveTitle(ui.expectedTabTitle);
      });

      await test.step('Assert: Khối biểu mẫu có tiêu đề "Login"', async () => {
        await expect(loginPage.formHeading, 'Tiêu đề "Login" của biểu mẫu phải hiển thị').toBeVisible();
      });

      await test.step(`Assert: Thẻ body mang class "${ui.expectedBodyClass}" (ghi chú kỹ thuật)`, async () => {
        await expect(loginPage.body, `body phải mang class ${ui.expectedBodyClass}`).toContainClass(ui.expectedBodyClass);
      });
    },
  );

  test(
    tcTitle('CRM_LOGIN_TC_002', 'Biểu mẫu đăng nhập đủ thành phần và đúng trạng thái mặc định'),
    { tag: ['@smoke', '@criticalpath', '@accessibility', '@techcheck', '@login'] },
    async ({ loginPage }) => {
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_002',
        requirements: ['REQ-LOGIN-02', 'REQ-LOGIN-03'],
        priority: 'Critical',
        description: 'Kiểm tra biểu mẫu vừa nạp có đủ 5 thành phần, con trỏ sẵn trong ô Email, ô Remember me rỗng và bấm được, '
          + 'nút Login bấm được khi hai ô rỗng, mật khẩu bị che, và bấm chữ Remember me thì tích ô vuông.',
      });

      await test.step('Arrange: Mở trang đăng nhập, không bấm vào đâu', async () => {
        await loginPage.open();
      });

      await test.step('Assert 1: Đủ 5 thành phần, liên kết Forgot Password? nằm dưới nút Login', async () => {
        await expect(loginPage.emailInput, 'Ô nhập Email Address phải hiển thị').toBeVisible();
        await expect(loginPage.passwordInput, 'Ô nhập Password phải hiển thị').toBeVisible();
        await expect(loginPage.rememberCheckbox, 'Ô tích Remember me phải hiển thị').toBeVisible();
        await expect(loginPage.loginButton, 'Nút Login phải hiển thị').toBeVisible();
        await expect(loginPage.forgotPasswordLink, 'Liên kết Forgot Password? phải hiển thị').toBeVisible();
        expect(await loginPage.isForgotLinkBelowLoginButton(), 'Forgot Password? phải nằm dưới nút Login').toBe(true);
      });

      await test.step('Assert 2: Con trỏ đã sẵn trong ô Email mà không cần bấm', async () => {
        await expect(loginPage.emailInput, 'Ô Email phải được focus sẵn khi vừa nạp trang').toBeFocused();
      });

      await test.step('Assert 3: Ô Remember me đang rỗng và không bị khoá', async () => {
        await expect(loginPage.rememberCheckbox, 'Remember me mặc định phải rỗng').not.toBeChecked();
        await expect(loginPage.rememberCheckbox, 'Remember me không được bị khoá').toBeEnabled();
      });

      await test.step('Assert 4: Nút Login nền xanh đậm chữ trắng, bấm được khi hai ô còn rỗng', async () => {
        await expect(loginPage.emailInput, 'Ô Email phải đang rỗng').toHaveValue('');
        await expect(loginPage.passwordInput, 'Ô Password phải đang rỗng').toHaveValue('');
        await expect(loginPage.loginButton, 'Nút Login phải bấm được').toBeEnabled();
        await expect(loginPage.loginButton, 'Nền nút Login phải xanh đậm')
          .toHaveCSS('background-color', ui.loginButtonColors.background);
        await expect(loginPage.loginButton, 'Chữ nút Login phải trắng').toHaveCSS('color', ui.loginButtonColors.text);
      });

      await test.step('Act 5: Gõ mật khẩu mẫu vào ô Password', async () => {
        await loginPage.typePassword(ui.maskedPasswordSample);
      });

      await test.step('Assert 5: Mật khẩu hiển thị dạng dấu chấm, không hiện chữ', async () => {
        await expect(loginPage.passwordInput, 'Ô Password phải là kiểu password (che ký tự)')
          .toHaveAttribute('type', 'password');
        await expect(loginPage.passwordInput, 'Ô Password phải nhận đủ ký tự đã gõ')
          .toHaveValue(ui.maskedPasswordSample);
      });

      await test.step('Act 6: Bấm vào chữ "Remember me"', async () => {
        await loginPage.tickRememberMeByLabelText();
      });

      await test.step('Assert 6: Ô vuông Remember me chuyển sang tích', async () => {
        await expect(loginPage.rememberCheckbox, 'Bấm vào nhãn phải tích ô Remember me').toBeChecked();
      });

      await test.step('Assert: Thuộc tính kỹ thuật của biểu mẫu (ghi chú kỹ thuật)', async () => {
        await expect(loginPage.loginForm, 'form phải gửi về chính trang đăng nhập')
          .toHaveAttribute('action', `${env.baseURL}${loginPage.path}`);
        await expect(loginPage.loginForm, 'form phải dùng method post').toHaveAttribute('method', ui.formMethod);
        await expect(loginPage.emailInput, 'input#email phải có autofocus').toHaveAttribute('autofocus', ui.emailAutofocus);
        await expect(loginPage.emailLabel, 'label[for=email] phải khớp ô Email').toHaveText(ui.labels.email);
        await expect(loginPage.passwordLabel, 'label[for=password] phải khớp ô Password').toHaveText(ui.labels.password);
        await expect(loginPage.rememberLabel, 'label[for=remember] phải khớp ô Remember me').toHaveText(ui.labels.remember);
      });
    },
  );

  test(
    tcTitle('CRM_LOGIN_TC_003', 'Trang đăng nhập không có CAPTCHA, không đăng nhập bên thứ ba, không nạp JavaScript'),
    { tag: ['@regression', '@security', '@techcheck', '@login'] },
    async ({ loginPage }) => {
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_003',
        requirements: ['REQ-LOGIN-05', 'REQ-LOGIN-36', 'REQ-LOGIN-37'],
        priority: 'Medium',
        description: 'Kiểm tra trang đăng nhập không có CAPTCHA, chỉ có một nút gửi Login, không có nút đăng nhập bên thứ ba '
          + 'và không nạp bất kỳ tệp/khối JavaScript nào.',
      });

      await test.step('Arrange: Mở trang đăng nhập', async () => {
        await loginPage.open();
      });

      const scriptRequests = await test.step('Act: Nạp lại trang một lần', async () =>
        loginPage.reloadCollectingScriptRequests());

      await test.step('Assert 1: Không có khối CAPTCHA nào', async () => {
        await expect(loginPage.captchaWidgets, 'Không được có phần tử CAPTCHA/reCAPTCHA').toHaveCount(0);
      });

      await test.step('Assert 2: Chỉ một nút gửi duy nhất là Login, không có đăng nhập bên thứ ba', async () => {
        await expect(loginPage.loginForm, 'Toàn trang phải có đúng 1 biểu mẫu').toHaveCount(1);
        await expect(loginPage.submitControls, 'Toàn trang phải có đúng 1 nút gửi').toHaveCount(1);
        await expect(loginPage.loginButton, 'Nút gửi duy nhất phải là Login').toBeVisible();
        await expect(loginPage.thirdPartyLoginControls, 'Không được có nút Google/Facebook/Microsoft').toHaveCount(0);
      });

      await test.step('Assert 3: Trang không nạp JavaScript', async () => {
        await expect(loginPage.scriptTags, 'Không được có thẻ <script> nào').toHaveCount(0);
        expect(scriptRequests, 'Không được có request tải tệp .js nào khi nạp trang').toEqual([]);
        await expect(loginPage.loginButton, 'Nút Login phải bấm được ngay khi vừa tải').toBeEnabled();
      });
    },
  );

  test(
    tcTitle('CRM_LOGIN_TC_004', 'Bấm logo trên trang đăng nhập thì về trang chủ công khai'),
    { tag: ['@regression', '@knownbug', '@login'] },
    async ({ page, loginPage }) => {
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_004',
        requirements: ['REQ-LOGIN-04'],
        priority: 'Low',
        description: 'Kiểm tra bấm logo phía trên khối biểu mẫu thì chuyển về trang chủ công khai, rời khỏi khu /admin.',
      });
      await markKnownBug('BUG_login_1787226513_TC004', 'docs/bugs/login/web/BUG_login_1787226513_TC004.md');
      const publicHome = `${env.baseURL}${ui.publicHomePath}`;

      await test.step('Arrange: Mở trang đăng nhập', async () => {
        await loginPage.open();
      });

      await test.step('Act: Bấm logo ANHTESTER', async () => {
        await loginPage.clickLogo();
      });

      await test.step(`Assert: Thanh địa chỉ dừng ở trang chủ công khai ${publicHome}`, async () => {
        await expect(page, `Bấm logo phải dẫn về ${publicHome}`).toHaveURL(publicHome);
      });
    },
  );
});
