// Gửi tóm tắt kết quả chạy test vào group Telegram — gọi từ job `notify` của .github/workflows/playwright.yml.
// Đọc summary.json + test-results.json do `allure generate` sinh ra (Allure 3, plugin awesome).
// Không gửi file report: bản 1 file nặng hơn 100MB, vượt giới hạn 50MB của Bot API → chỉ gửi link.
//
// Biến môi trường:
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID  bắt buộc để gửi — thiếu thì bỏ qua, không làm đỏ CI
//   TELEGRAM_THREAD_ID                    tuỳ chọn — id topic khi group bật chế độ Topics
//   REPORT_URL, RUN_URL, DEPLOY_RESULT    link report Pages, link run Actions, kết quả job deploy-report
//
// Chạy thử ở máy, chỉ in tin nhắn ra màn hình, không gửi:
//   node scripts/telegram-notify.mjs reports/allure-report --dry-run
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const reportDir = args.find((a) => !a.startsWith('--')) ?? 'reports/allure-report';
const env = process.env;

// Bot API giới hạn 4096 ký tự — danh sách test lỗi dài quá thì cắt bớt
const MAX_FAILED_LISTED = 15;
const STATUS_ICON = { failed: '❌', broken: '💥' };

const escapeHtml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function readJson(file) {
  const path = resolve(reportDir, file);
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

function buildMessage() {
  const summary = readJson('summary.json');
  const results = readJson('test-results.json');
  const lines = [];

  if (!summary) {
    lines.push('⚠️ <b>Perfex CRM — không có kết quả test</b>');
    lines.push('Run dừng trước khi sinh Allure report. Xem log trên GitHub Actions.');
  } else {
    const { total = 0, passed = 0, failed = 0, broken = 0, skipped = 0 } = summary.stats;
    const ok = failed + broken === 0;
    const executed = total - skipped;
    const passRate = executed > 0 ? Math.round((passed / executed) * 100) : 0;

    lines.push(`${ok ? '✅' : '❌'} <b>${escapeHtml(summary.name)}</b> — ${ok ? 'PASS' : 'FAIL'}`);
    lines.push('');
    lines.push(`Tổng: <b>${total}</b> · ✅ ${passed} · ❌ ${failed} · 💥 ${broken} · ⏭️ ${skipped}`);
    lines.push(`Tỉ lệ PASS (không tính skip): <b>${passRate}%</b>`);
    if (summary.flakyTests?.length) lines.push(`🔁 Flaky: ${summary.flakyTests.length}`);

    const failedTests = Object.values(results?.byId ?? {}).filter((t) => t.status in STATUS_ICON);
    if (failedTests.length) {
      lines.push('');
      lines.push('<b>Test lỗi:</b>');
      for (const t of failedTests.slice(0, MAX_FAILED_LISTED)) {
        lines.push(`${STATUS_ICON[t.status]} ${escapeHtml(t.name)}`);
      }
      if (failedTests.length > MAX_FAILED_LISTED) {
        lines.push(`… và ${failedTests.length - MAX_FAILED_LISTED} test khác`);
      }
    }
  }

  lines.push('');
  const meta = [env.GITHUB_REF_NAME, env.GITHUB_EVENT_NAME, env.GITHUB_SHA?.slice(0, 7)].filter(Boolean);
  if (meta.length) lines.push(`<code>${escapeHtml(meta.join(' · '))}</code>`);
  if (summary && env.REPORT_URL && env.DEPLOY_RESULT === 'success') {
    lines.push(`📊 <a href="${escapeHtml(env.REPORT_URL)}">Xem Allure report</a>`);
  } else if (summary) {
    lines.push('⚠️ Chưa đăng được report lên GitHub Pages — tải artifact <code>test-reports</code> trong run.');
  }
  if (env.RUN_URL) lines.push(`🔗 <a href="${escapeHtml(env.RUN_URL)}">Mở run trên GitHub Actions</a>`);

  return lines.join('\n');
}

async function send(text) {
  const body = {
    chat_id: env.TELEGRAM_CHAT_ID,
    text,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  };
  if (env.TELEGRAM_THREAD_ID) body.message_thread_id = Number(env.TELEGRAM_THREAD_ID);

  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  // Chỉ in description, không in URL — URL chứa bot token
  if (!data.ok) throw new Error(`Telegram từ chối tin nhắn: ${data.error_code} ${data.description}`);
}

const message = buildMessage();

if (dryRun) {
  process.stdout.write(`${message}\n`);
} else if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
  process.stdout.write('::warning::Thiếu secret TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID — bỏ qua gửi Telegram\n');
} else {
  await send(message);
}
