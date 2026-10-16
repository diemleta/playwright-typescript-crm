import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

export interface Account {
  email: string;
  password: string;
}

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${key}. Kiểm tra file .env`);
  }
  return value;
}

/** Tài khoản tuỳ chọn — thiếu một trong hai biến thì trả undefined để test tự skip */
function optionalAccount(emailKey: string, passwordKey: string): Account | undefined {
  const email = process.env[emailKey];
  const password = process.env[passwordKey];
  return email && password ? { email, password } : undefined;
}

export const env = {
  baseURL: required('BASE_URL').replace(/\/+$/, ''),
  headless: process.env.HEADLESS !== 'false',
  workers: Number(process.env.WORKERS ?? 5),
  timeout: Number(process.env.TIMEOUT ?? 30_000),
  // Đọc lười — test không cần đăng nhập (VD trang login) vẫn chạy được khi chưa khai credentials
  get username(): string {
    return required('TEST_USERNAME');
  },
  get password(): string {
    return required('TEST_PASSWORD');
  },
  get projectManager(): Account | undefined {
    return optionalAccount('PM_EMAIL', 'PM_PASSWORD');
  },
  get customer(): Account | undefined {
    return optionalAccount('CUSTOMER_EMAIL', 'CUSTOMER_PASSWORD');
  },
  /** Tài khoản staff có mật khẩu chứa chữ cái — chỉ CRM_LOGIN_TC_014 dùng */
  get caseSensitiveStaff(): Account | undefined {
    return optionalAccount('TC014_EMAIL', 'TC014_PASSWORD');
  },
};
