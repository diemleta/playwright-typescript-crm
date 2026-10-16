import { Locator, Page, Request, test } from '@playwright/test';
import { AuthFormPage } from './auth-form.page';

export interface BrowserValidationResult {
  /** Biểu mẫu có thực sự được gửi đi không */
  submitted: boolean;
  /** Trình duyệt có bắn sự kiện invalid (bật bong bóng cảnh báo) cho ô Email không */
  emailInvalid: boolean;
}

/** Trang đăng nhập khu quản trị — /admin/authentication */
export class LoginPage extends AuthFormPage {
  readonly path = '/admin/authentication';

  readonly formHeading: Locator;
  readonly loginForm: Locator;
  readonly rememberLabelText: Locator;
  readonly logoLink: Locator;
  readonly emailLabel: Locator;
  readonly passwordLabel: Locator;
  readonly rememberLabel: Locator;
  readonly submitControls: Locator;
  readonly captchaWidgets: Locator;
  readonly scriptTags: Locator;
  readonly thirdPartyLoginControls: Locator;

  constructor(page: Page) {
    super(page);
    this.formHeading = page.getByRole('heading', { level: 1, name: 'Login' });
    this.loginForm = page.locator('form');
    this.rememberLabelText = page.getByText('Remember me', { exact: true });
    this.logoLink = page.getByRole('link', { name: 'Perfex CRM | Anh Tester Demo' });
    this.emailLabel = page.locator('label[for="email"]');
    this.passwordLabel = page.locator('label[for="password"]');
    this.rememberLabel = page.locator('label[for="remember"]');
    this.submitControls = page.locator('button[type="submit"], input[type="submit"]');
    this.captchaWidgets = page.locator('.g-recaptcha, [class*="captcha"], iframe[src*="recaptcha"]');
    this.scriptTags = page.locator('script');
    this.thirdPartyLoginControls = page
      .getByRole('button', { name: /google|facebook|microsoft/i })
      .or(page.getByRole('link', { name: /google|facebook|microsoft/i }));
  }

  async tickRememberMeByLabelText(): Promise<void> {
    await test.step('Bấm vào chữ "Remember me"', async () => {
      await this.rememberLabelText.click();
    });
  }

  async typePassword(value: string): Promise<void> {
    await test.step('Gõ vào ô Password', async () => {
      await this.passwordInput.pressSequentially(value);
    });
  }

  async isForgotLinkBelowLoginButton(): Promise<boolean> {
    const button = await this.loginButton.boundingBox();
    const link = await this.forgotPasswordLink.boundingBox();
    return !!button && !!link && link.y >= button.y + button.height;
  }

  async clickLogo(): Promise<void> {
    await test.step('Bấm logo phía trên khối biểu mẫu', async () => {
      await Promise.all([this.page.waitForEvent('load'), this.logoLink.click()]);
    });
  }

  /** Nạp lại trang và ghi nhận mọi request tải JavaScript phát sinh trong lúc nạp */
  async reloadCollectingScriptRequests(): Promise<string[]> {
    return test.step('Nạp lại trang, ghi nhận request JavaScript', async () => {
      const scripts: string[] = [];
      const onRequest = (request: Request) => {
        if (request.resourceType() === 'script' || /\.js(\?|$)/.test(request.url())) {
          scripts.push(request.url());
        }
      };
      this.page.on('request', onRequest);
      await this.page.reload({ waitUntil: 'load' });
      this.page.off('request', onRequest);
      return scripts;
    });
  }

  /**
   * Bấm Login khi ô Email sai định dạng. Sự kiện submit/invalid bắn đồng bộ ngay trong lúc click,
   * nên đọc cờ ngay sau click là chính xác — không cần chờ thêm.
   */
  async submitExpectingBrowserValidation(): Promise<BrowserValidationResult> {
    return test.step('Bấm nút Login (trình duyệt tự kiểm định dạng email)', async () => {
      await this.loginForm.evaluate((form) => {
        const flags = { submitted: false, emailInvalid: false };
        (window as unknown as { loginFlags: typeof flags }).loginFlags = flags;
        form.addEventListener('submit', () => { flags.submitted = true; });
        form.querySelector('#email')?.addEventListener('invalid', () => { flags.emailInvalid = true; });
      });
      await this.clickWhenReady(this.loginButton);
      return this.page.evaluate(
        () => (window as unknown as { loginFlags: BrowserValidationResult }).loginFlags,
      );
    });
  }
}
