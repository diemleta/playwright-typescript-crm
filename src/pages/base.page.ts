import { Page, Locator, Response, expect, test } from '@playwright/test';
import { logger } from '../utils/logger';

/** Đếm hộp thoại JS (alert/confirm/prompt) bật lên — tự đóng để không treo test */
export interface DialogTracker {
  readonly count: number;
}

export abstract class BasePage {
  /** Đường dẫn tương đối của trang, ghép với baseURL */
  abstract readonly path: string;

  readonly body: Locator;

  constructor(protected readonly page: Page) {
    this.body = page.locator('body');
  }

  /** Mở trang, trả về response của request tài liệu để test kiểm được HTTP status */
  async open(): Promise<Response | null> {
    return test.step(`Mở trang ${this.path}`, async () => {
      logger.info(`Mở trang ${this.path}`);
      const response = await this.page.goto(this.path);
      await this.page.waitForLoadState('domcontentloaded');
      return response;
    });
  }

  /** Mở thẳng một URL tương đối bất kỳ (gõ vào thanh địa chỉ) */
  async gotoPath(path: string): Promise<Response | null> {
    return test.step(`Gõ thẳng ${path} vào thanh địa chỉ`, async () => {
      logger.info(`Điều hướng tới ${path}`);
      const response = await this.page.goto(path);
      await this.page.waitForLoadState('domcontentloaded');
      return response;
    });
  }

  async reload(): Promise<void> {
    await test.step('Nạp lại trang', async () => {
      await this.page.reload();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  trackDialogs(): DialogTracker {
    let count = 0;
    this.page.on('dialog', (dialog) => {
      count += 1;
      logger.warn(`Hộp thoại ${dialog.type()} bật lên trên ${this.path}`);
      void dialog.dismiss();
    });
    return {
      get count() {
        return count;
      },
    };
  }

  /** Click sau khi element đã sẵn sàng — dựa vào auto-waiting của Playwright */
  protected async clickWhenReady(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
    await locator.click();
  }

  /** Điền text, xoá giá trị cũ trước */
  protected async fillField(locator: Locator, value: string): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.fill(value);
  }
}
