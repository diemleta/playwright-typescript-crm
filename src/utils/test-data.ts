/** Sinh data unique + traceable: nhìn vào DB/log biết ngay test nào tạo ra */
export class TestData {
  private static stamp(): string {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  static email(testName: string): string {
    return `auto_${testName}_${this.stamp()}@auto.test`.toLowerCase();
  }

  static username(testName: string): string {
    return `auto_${testName}_${this.stamp()}`;
  }

  static code(prefix: string): string {
    return `${prefix}_${this.stamp()}`;
  }

  /** Biến thể email cho phép thử chuẩn hoá (CRM_LOGIN_TC_007) */
  static transformEmail(email: string, transform: string): string {
    switch (transform) {
      case 'mixed':
        return [...email].map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase())).join('');
      case 'upper':
        return email.toUpperCase();
      case 'padBoth':
        return `  ${email}  `;
      case 'padEnd':
        return `${email} `;
      default:
        throw new Error(`Biến thể email không hỗ trợ: ${transform}`);
    }
  }

  /** Đảo hoa ↔ thường cho mọi ký tự chữ cái */
  static invertCase(value: string): string {
    return [...value]
      .map((ch) => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()))
      .join('');
  }
}
