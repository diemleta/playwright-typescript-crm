import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/** Trang Dashboard khu quản trị — /admin/ */
export class DashboardPage extends BasePage {
  readonly path = '/admin/';

  readonly sideMenu: Locator;
  /** Mục cấp 1 của menu trái — chỉ các <li class="menu-item-*">, bỏ khối đầu menu không phải mục điều hướng */
  readonly sideMenuItems: Locator;
  readonly userAvatar: Locator;
  readonly errorAlerts: Locator;

  constructor(page: Page) {
    super(page);
    this.sideMenu = page.locator('#side-menu');
    this.sideMenuItems = page.locator('#side-menu > li[class*="menu-item-"]');
    this.userAvatar = page.locator('li.header-user-profile img.staff-profile-image-small');
    this.errorAlerts = page.locator('.alert.alert-danger');
  }

  /** Mục cấp 1 của menu trái theo đúng tên hiển thị */
  sideMenuItem(name: string): Locator {
    return this.sideMenuItems.filter({ has: this.page.locator(':scope > a').getByText(name, { exact: true }) });
  }
}
