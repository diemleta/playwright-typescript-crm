import { Locator, Page, Response, test } from '@playwright/test';
import { BasePage } from './base.page';
import { logger } from '../utils/logger';

/**
 * Biểu mẫu đăng nhập dùng chung cho khu quản trị (/admin/authentication)
 * và cổng khách hàng (/login) — hai trang cùng nhãn Email Address / Password / Remember me / Login.
 */
export abstract class AuthFormPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberCheckbox: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorAlerts: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email Address');
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.rememberCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
    this.errorAlerts = page.locator('.alert.alert-danger');
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await test.step(`Nhập Email "${email}" và Password`, async () => {
      await this.fillField(this.emailInput, email);
      await this.fillField(this.passwordInput, password);
    });
  }

  /**
   * Bấm Login và chờ tài liệu mới nạp xong. Trả về response tài liệu CUỐI cùng
   * (bỏ qua bước chuyển hướng 3xx) để test kiểm HTTP status.
   */
  async submit(): Promise<Response> {
    return test.step('Bấm nút Login', async () =>
      this.waitForNextDocument(() => this.clickWhenReady(this.loginButton)));
  }

  /**
   * Bấm Login hai lần liên tiếp thật nhanh (double-click).
   * Lưu ý: Chromium gộp hai lần gửi trên cùng một trang thành MỘT request — đếm bằng recordLoginSubmissions().
   */
  async submitTwiceQuickly(): Promise<Response> {
    return test.step('Bấm nút Login hai lần liên tiếp', async () =>
      this.waitForNextDocument(() => this.loginButton.dblclick()));
  }

  async login(email: string, password: string): Promise<Response> {
    return test.step(`Đăng nhập bằng "${email}"`, async () => {
      logger.info(`Đăng nhập ${this.path} bằng ${email}`);
      await this.fillCredentials(email, password);
      return this.submit();
    });
  }

  /**
   * Bỏ chuẩn hoá của trình duyệt cho ô Email: ô type="email" tự cắt khoảng trắng đầu/cuối trước khi gửi,
   * nên phép thử "máy chủ có cắt khoảng trắng không" phải đổi ô sang type="text" để chuỗi tới máy chủ nguyên văn.
   */
  async disableBrowserEmailSanitizing(): Promise<void> {
    await test.step('Tắt chuẩn hoá email phía trình duyệt (ô Email → type=text)', async () => {
      await this.emailInput.evaluate((el) => el.setAttribute('type', 'text'));
    });
  }

  /**
   * Ghi lại giá trị trường email của MỖI lần gửi biểu mẫu đăng nhập (request POST), theo thứ tự.
   * Chỉ đọc trường email — không lưu mật khẩu.
   */
  recordLoginSubmissions(): string[] {
    const emails: string[] = [];
    this.page.on('request', (request) => {
      if (request.method() !== 'POST') return;
      const email = new URLSearchParams(request.postData() ?? '').get('email');
      if (email !== null) emails.push(email);
    });
    return emails;
  }

  /** Thông báo lỗi đang hiển thị, theo thứ tự trên xuống */
  async errorMessages(): Promise<string[]> {
    return (await this.errorAlerts.allInnerTexts()).map((text) => text.trim());
  }

  private async waitForNextDocument(action: () => Promise<void>): Promise<Response> {
    const finalDocument = this.page.waitForResponse((response) =>
      response.request().isNavigationRequest()
      && response.request().frame() === this.page.mainFrame()
      && !(response.status() >= 300 && response.status() < 400));
    // Chờ 'load' của tài liệu MỚI — URL trước/sau khi gửi giống nhau nên không chờ theo URL được
    const loaded = this.page.waitForEvent('load');
    await action();
    const [response] = await Promise.all([finalDocument, loaded]);
    return response;
  }
}
