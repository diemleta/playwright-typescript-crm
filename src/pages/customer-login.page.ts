import { AuthFormPage } from './auth-form.page';

/** Trang đăng nhập cổng khách hàng — /login (hệ thống đăng nhập tách biệt với /admin) */
export class CustomerLoginPage extends AuthFormPage {
  readonly path = '/login';
}
