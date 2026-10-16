import * as fs from 'fs';
import * as path from 'path';

const LOG_FILE = path.resolve('reports/logs/test-execution.log');

type Level = 'INFO' | 'WARN' | 'ERROR';

/** Ghi log ra reports/logs/ — không dùng console.log để report không dính stdout */
function write(level: Level, message: string): void {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  const worker = process.env.TEST_WORKER_INDEX ?? '-';
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} [worker ${worker}] ${level} ${message}\n`);
}

export const logger = {
  info: (message: string) => write('INFO', message),
  warn: (message: string) => write('WARN', message),
  error: (message: string) => write('ERROR', message),
};
