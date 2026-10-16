import * as allure from 'allure-js-commons';
import { test } from '@playwright/test';

/** Cột Priority của manual TC */
export type TcPriority = 'Critical' | 'High' | 'Medium' | 'Low';

const SEVERITY_BY_PRIORITY: Record<TcPriority, string> = {
  Critical: 'critical',
  High: 'normal',
  Medium: 'minor',
  Low: 'trivial',
};

export interface TcMeta {
  tcId: string;
  requirements: string[];
  priority: TcPriority;
  description: string;
  /** Biến thể a/b/c... của TC (nếu có) */
  variant?: string;
}

/** Tên test hiển thị: `<TC ID>[-<biến thể>] - <mô tả>` — reporting_rules.md mục 1 */
export function tcTitle(tcId: string, title: string, variant?: string): string {
  return `${tcId}${variant ? `-${variant}` : ''} - ${title}`;
}

/** Gắn metadata Allure — testId gọi ĐẦU TIÊN để nằm trong 8 nhóm label Allure 3 hiển thị */
export async function applyTcMeta(meta: TcMeta): Promise<void> {
  await allure.label('testId', meta.tcId);
  if (meta.variant) {
    await allure.parameter('Biến thể', meta.variant);
  }
  await allure.severity(SEVERITY_BY_PRIORITY[meta.priority]);
  await allure.feature('Đăng nhập');
  await allure.description(meta.description);
  for (const requirement of meta.requirements) {
    await allure.label('requirement', requirement);
  }
}

/**
 * Đánh dấu test đang phơi một bug đã biết: assertion GIỮ NGUYÊN theo TC,
 * test được kỳ vọng FAIL. Khi dev fix xong, test chuyển sang PASS bất ngờ → Playwright báo đỏ để gỡ đánh dấu.
 */
export async function markKnownBug(bugId: string, bugFile: string): Promise<void> {
  test.fail(true, `Lỗi đã biết ${bugId}`);
  await allure.issue(bugFile, bugId);
}
