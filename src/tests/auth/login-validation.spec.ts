import { test, expect } from '../../fixtures/base.fixture';
import { env } from '../../utils/env.config';
import { applyTcMeta, markKnownBug, tcTitle } from '../../utils/report';
import { TestData } from '../../utils/test-data';
import loginData from '../../../test-data/login.json';

type MessageKey = keyof typeof loginData.messages;

const messages = loginData.messages;
const invalidCredentials = messages.invalidCredentials;
const lockoutKeywords = new RegExp(messages.lockoutKeywords, 'i');
const databaseError = new RegExp(messages.databaseErrorPattern, 'i');

test.describe('Đăng nhập — Kiểm tra dữ liệu nhập & bảo mật', () => {
  for (const data of loginData.requiredFieldVariants) {
    test(
      tcTitle('CRM_LOGIN_TC_011', `Kiểm tra trường bắt buộc trên biểu mẫu đăng nhập (${data.label})`, data.variant),
      { tag: data.variant === 'a' ? ['@smoke', '@regression', '@login'] : ['@regression', '@login'] },
      async ({ page, loginPage }) => {
        await applyTcMeta({
          tcId: 'CRM_LOGIN_TC_011',
          variant: data.variant,
          requirements: ['REQ-LOGIN-10', 'REQ-LOGIN-11', 'REQ-LOGIN-12'],
          priority: 'Critical',
          description: `Biến thể ${data.variant} — ${data.label}: gửi biểu mẫu thì trang nạp lại, không vào được Dashboard `
            + 'và hiện đúng các dải báo lỗi trường bắt buộc theo đúng thứ tự.',
        });
        const expectedErrors = data.expectedErrors.map((key) => messages[key as MessageKey]);

        await test.step('Arrange: Mở trang đăng nhập', async () => {
          await loginPage.open();
        });

        await test.step('Act: Nhập Email/Password theo biến thể rồi bấm Login', async () => {
          await loginPage.fillCredentials(data.email, data.password);
          await loginPage.submit();
        });

        await test.step(`Assert: Hiện đúng ${expectedErrors.length} dải báo lỗi theo thứ tự trên xuống`, async () => {
          await expect(loginPage.errorAlerts, 'Nội dung và thứ tự dải báo lỗi trường bắt buộc').toHaveText(expectedErrors);
        });

        await test.step('Assert: Vẫn ở trang đăng nhập, không vào được Dashboard', async () => {
          await expect(page, 'Phải ở lại trang đăng nhập').toHaveURL(`${env.baseURL}${loginPage.path}`);
        });
      },
    );
  }

  for (const data of loginData.malformedEmailVariants) {
    test(
      tcTitle('CRM_LOGIN_TC_012', `Email sai định dạng bị trình duyệt chặn ngay, biểu mẫu không gửi đi (${data.label})`, data.variant),
      { tag: ['@regression', '@boundary', '@security', '@techcheck', '@login'] },
      async ({ page, loginPage }) => {
        await applyTcMeta({
          tcId: 'CRM_LOGIN_TC_012',
          variant: data.variant,
          requirements: ['REQ-LOGIN-13'],
          priority: 'High',
          description: `Biến thể ${data.variant} — ${data.label}: trình duyệt chặn ô Email sai định dạng, biểu mẫu không gửi lên `
            + 'máy chủ, dữ liệu đã nhập còn nguyên. Không chấm theo nội dung bong bóng vì do trình duyệt sinh.',
        });
        const postRequests: string[] = [];
        page.on('request', (request) => {
          if (request.method() === 'POST') postRequests.push(request.url());
        });

        await test.step('Arrange: Mở trang đăng nhập', async () => {
          await loginPage.open();
        });

        const result = await test.step('Act: Nhập Email sai định dạng, Password hợp lệ, bấm Login', async () => {
          await loginPage.fillCredentials(data.email, loginData.malformedEmailPassword);
          return loginPage.submitExpectingBrowserValidation();
        });

        await test.step('Assert: Trình duyệt bật cảnh báo ở ô Email', async () => {
          expect(result.emailInvalid, 'Ô Email phải bị trình duyệt đánh dấu không hợp lệ').toBe(true);
        });

        await test.step('Assert: Biểu mẫu không gửi đi, dữ liệu còn nguyên, không có dải lỗi của hệ thống', async () => {
          expect(result.submitted, 'Biểu mẫu không được gửi đi').toBe(false);
          await expect(loginPage.emailInput, 'Ô Email phải giữ nguyên chuỗi đã nhập').toHaveValue(data.email);
          await expect(loginPage.passwordInput, 'Ô Password phải giữ nguyên giá trị đã nhập')
            .toHaveValue(loginData.malformedEmailPassword);
          await expect(loginPage.errorAlerts, 'Không được hiện dải báo lỗi của hệ thống').toHaveCount(0);
          expect(postRequests, 'Không được phát sinh request POST nào (ghi chú kỹ thuật)').toEqual([]);
        });
      },
    );
  }

  test(
    tcTitle('CRM_LOGIN_TC_013', 'Sai thông tin đăng nhập trả về một thông báo chung, không tiết lộ email nào có thật'),
    { tag: ['@smoke', '@regression', '@security', '@login'] },
    async ({ page, loginPage }) => {
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_013',
        requirements: ['REQ-LOGIN-14', 'REQ-LOGIN-15'],
        priority: 'Critical',
        description: 'Gửi (a) email có thật + mật khẩu sai và (b) email không tồn tại; cả hai phải trả đúng một dải '
          + '"Invalid email or password", ở lại trang đăng nhập, và hai kết quả giống hệt nhau.',
      });
      const variants = [
        { variant: 'a', label: 'Email có thật, mật khẩu sai', email: env.username, password: loginData.wrongPassword },
        { variant: 'b', label: 'Email không tồn tại', email: TestData.email('tc013'), password: loginData.anyPassword },
      ];
      const outcomes: { messages: string[]; url: string }[] = [];

      await test.step('Arrange: Mở trang đăng nhập', async () => {
        await loginPage.open();
      });

      for (const data of variants) {
        await test.step(`Act: Biến thể ${data.variant} — ${data.label}, bấm Login`, async () => {
          await loginPage.fillCredentials(data.email, data.password);
          await loginPage.submit();
        });

        await test.step(`Assert: Biến thể ${data.variant} — đúng 1 dải "${invalidCredentials}", ở lại trang đăng nhập`, async () => {
          await expect(loginPage.errorAlerts, `Biến thể ${data.variant} phải có đúng 1 dải báo lỗi chung`)
            .toHaveText([invalidCredentials]);
          await expect(page, `Biến thể ${data.variant} phải ở lại trang đăng nhập`)
            .toHaveURL(`${env.baseURL}${loginPage.path}`);
          outcomes.push({ messages: await loginPage.errorMessages(), url: page.url() });
        });

        await loginPage.reload();
      }

      await test.step('Assert: Hai biến thể cho kết quả giống hệt nhau — không lộ email nào có thật', async () => {
        expect(outcomes[1], 'Email không tồn tại phải cho kết quả y hệt email có thật + sai mật khẩu').toEqual(outcomes[0]);
      });
    },
  );

  test(
    tcTitle('CRM_LOGIN_TC_014', 'Mật khẩu đúng nhưng sai kiểu chữ hoa/thường thì bị từ chối'),
    { tag: ['@regression', '@security', '@login'] },
    async ({ page, loginPage }) => {
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_014',
        requirements: ['REQ-LOGIN-14'],
        priority: 'Medium',
        description: 'Đăng nhập bằng mật khẩu đúng nhưng đảo hoa/thường toàn bộ chữ cái thì bị từ chối với thông báo chung.',
      });
      // Tài khoản demo không dùng được — mật khẩu chỉ có chữ số, không có gì để đảo hoa/thường (RISK-LOGIN-07)
      const account = env.caseSensitiveStaff;
      test.skip(!account, 'Thiếu TC014_EMAIL / TC014_PASSWORD trong .env');
      const invertedPassword = TestData.invertCase(account!.password);

      await test.step('Arrange: Xác nhận mật khẩu có chữ cái, mở trang đăng nhập', async () => {
        expect(invertedPassword, 'TC014_PASSWORD phải chứa ít nhất 1 chữ cái để đảo hoa/thường').not.toBe(account!.password);
        await loginPage.open();
      });

      await test.step('Act: Nhập email staff và mật khẩu đã đảo hoa/thường, bấm Login', async () => {
        await loginPage.fillCredentials(account!.email, invertedPassword);
        await loginPage.submit();
      });

      await test.step(`Assert: Đúng 1 dải "${invalidCredentials}", ở lại trang đăng nhập`, async () => {
        await expect(loginPage.errorAlerts, 'Phải có đúng 1 dải báo lỗi chung').toHaveText([invalidCredentials]);
        await expect(page, 'Phải ở lại trang đăng nhập').toHaveURL(`${env.baseURL}${loginPage.path}`);
      });
    },
  );

  for (const data of loginData.lockoutVariants) {
    test(
      tcTitle('CRM_LOGIN_TC_015', `Đăng nhập sai nhiều lần liên tiếp không làm khoá tài khoản (${data.label})`, data.variant),
      { tag: ['@regression', '@security', '@techcheck', '@authenticated', '@login'] },
      async ({ page, loginPage }) => {
        await applyTcMeta({
          tcId: 'CRM_LOGIN_TC_015',
          variant: data.variant,
          requirements: ['REQ-LOGIN-41'],
          priority: 'High',
          description: `Biến thể ${data.variant} — gửi sai ${data.attempts} lần liên tiếp: mỗi lần chỉ báo lỗi chung, `
            + 'không có thông báo khoá/hạn chế, không có HTTP 429, và ngay sau đó vẫn đăng nhập Admin thành công.',
        });
        const statuses: number[] = [];

        await test.step('Arrange: Mở trang đăng nhập', async () => {
          await loginPage.open();
        });

        for (let attempt = 1; attempt <= data.attempts; attempt += 1) {
          const email = data.sameEmail ? env.username : TestData.email(`tc015_${attempt}`);
          const password = data.sameEmail ? loginData.wrongPassword : loginData.ipLockoutPassword;

          await test.step(`Act: Lần sai thứ ${attempt}/${data.attempts}`, async () => {
            await loginPage.fillCredentials(email, password);
            statuses.push((await loginPage.submit()).status());
          });

          await test.step(`Assert: Lần ${attempt} chỉ trả đúng 1 dải "${invalidCredentials}"`, async () => {
            await expect(loginPage.errorAlerts, `Lần ${attempt}: nội dung báo lỗi không được đổi`).toHaveText([invalidCredentials]);
          });
        }

        await test.step('Assert: Không có thông báo khoá/hạn chế và không phản hồi nào trả HTTP 429', async () => {
          await expect(loginPage.body, 'Không được có thông báo khoá tài khoản / chặn IP').not.toContainText(lockoutKeywords);
          expect(statuses, 'Không phản hồi nào được trả HTTP 429').not.toContain(429);
        });

        await test.step('Act: Ngay sau đó đăng nhập bằng tài khoản Admin đúng', async () => {
          await loginPage.login(env.username, env.password);
        });

        await test.step('Assert: Đăng nhập thành công, dừng ở /admin/', async () => {
          await expect(page, 'Tài khoản không được bị khoá sau chuỗi đăng nhập sai')
            .toHaveURL(`${env.baseURL}${loginData.dashboard.path}`);
        });
      },
    );
  }

  test(
    tcTitle('CRM_LOGIN_TC_016', 'Sau khi đăng nhập thất bại, ô Email phải còn giữ email vừa nhập'),
    { tag: ['@regression', '@knownbug', '@techcheck', '@login'] },
    async ({ loginPage }) => {
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_016',
        requirements: ['REQ-LOGIN-16'],
        priority: 'High',
        description: 'Trong phiên trình duyệt sạch (không tự điền), đăng nhập sai thì ô Email do máy chủ trả về phải còn '
          + 'giữ email vừa nhập để người dùng không phải gõ lại.',
      });
      await markKnownBug('BUG_login_1787226514_TC016', 'docs/bugs/login/web/BUG_login_1787226514_TC016.md');

      await test.step('Arrange: Mở trang đăng nhập trong context sạch (tương đương cửa sổ ẩn danh)', async () => {
        await loginPage.open();
      });

      const response = await test.step('Act: Nhập email Admin với mật khẩu sai, bấm Login', async () => {
        await loginPage.fillCredentials(env.username, loginData.wrongPassword);
        return loginPage.submit();
      });

      await test.step(`Assert: Hiện dải báo lỗi "${invalidCredentials}"`, async () => {
        await expect(loginPage.errorAlerts, 'Phải hiện dải báo lỗi chung').toHaveText([invalidCredentials]);
      });

      await test.step('Assert: Ô Email còn giữ email vừa nhập', async () => {
        await expect(loginPage.emailInput, 'Ô Email phải còn hiển thị email vừa nhập').toHaveValue(env.username);
        const serverHtml = await response.text();
        expect(
          serverHtml.includes(`value="${env.username}"`),
          `HTML máy chủ trả về phải có value="${env.username}" ở input#email (ghi chú kỹ thuật)`,
        ).toBe(true);
      });
    },
  );

  for (const data of loginData.attackVariants) {
    test(
      tcTitle('CRM_LOGIN_TC_017', `Chuỗi tấn công nhập vào ô Password không vượt qua được xác thực và không được thực thi (${data.label})`, data.variant),
      { tag: ['@regression', '@security', '@techcheck', '@login'] },
      async ({ page, loginPage }) => {
        await applyTcMeta({
          tcId: 'CRM_LOGIN_TC_017',
          variant: data.variant,
          requirements: ['REQ-LOGIN-14'],
          priority: 'Critical',
          description: `Biến thể ${data.variant} — ${data.label}: chuỗi tấn công trong ô Password bị từ chối với thông báo chung, `
            + 'không bật hộp thoại, không lộ lỗi cơ sở dữ liệu, phản hồi HTTP 200 và chuỗi không xuất hiện dạng thẻ sống.',
        });
        const email = data.useNonExistentEmail ? TestData.email('tc017') : env.username;
        const dialogs = loginPage.trackDialogs();

        await test.step('Arrange: Mở trang đăng nhập', async () => {
          await loginPage.open();
        });

        const response = await test.step('Act: Nhập Email và chuỗi tấn công vào ô Password, bấm Login', async () => {
          await loginPage.fillCredentials(email, data.password);
          return loginPage.submit();
        });

        await test.step('Assert: Không vào được Dashboard, đúng 1 dải báo lỗi chung', async () => {
          await expect(loginPage.errorAlerts, 'Phải có đúng 1 dải báo lỗi chung').toHaveText([invalidCredentials]);
          await expect(page, 'Phải ở lại trang đăng nhập').toHaveURL(`${env.baseURL}${loginPage.path}`);
        });

        await test.step('Assert: Không hộp thoại nào bật lên, không lộ lỗi cơ sở dữ liệu', async () => {
          expect(dialogs.count, 'Không được có hộp thoại JavaScript nào bật lên').toBe(0);
          await expect(loginPage.body, 'Không được hiện thông báo lỗi cơ sở dữ liệu').not.toContainText(databaseError);
        });

        await test.step('Assert: Phản hồi HTTP 200 và chuỗi tấn công không xuất hiện dạng thẻ sống (ghi chú kỹ thuật)', async () => {
          expect(response.status(), 'Phản hồi phải là HTTP 200, không phải lỗi máy chủ').toBe(200);
          expect(await response.text(), 'Chuỗi tấn công không được nằm nguyên dạng trong HTML').not.toContain(data.password);
        });
      },
    );
  }

  test(
    tcTitle('CRM_LOGIN_TC_018', 'Mật khẩu chứa ký tự đa ngôn ngữ và emoji không làm hệ thống lỗi máy chủ'),
    { tag: ['@regression', '@boundary', '@localization', '@techcheck', '@login'] },
    async ({ page, loginPage }) => {
      await applyTcMeta({
        tcId: 'CRM_LOGIN_TC_018',
        requirements: ['REQ-LOGIN-14'],
        priority: 'Medium',
        description: 'Gửi mật khẩu tiếng Việt có dấu kèm emoji thì trang nạp lại bình thường (HTTP 200) về trang đăng nhập '
          + 'với đúng 1 dải báo lỗi tiếng Anh, không vỡ ký tự.',
      });

      await test.step('Arrange: Mở trang đăng nhập', async () => {
        await loginPage.open();
      });

      const response = await test.step('Act: Nhập email không tồn tại và mật khẩu đa ngôn ngữ + emoji, bấm Login', async () => {
        await loginPage.fillCredentials(TestData.email('tc018'), loginData.unicodePassword);
        return loginPage.submit();
      });

      await test.step('Assert: Trang nạp lại bình thường về trang đăng nhập, không lỗi máy chủ', async () => {
        expect(response.status(), 'Phản hồi phải là HTTP 200, không phải 500').toBe(200);
        await expect(page, 'Phải quay về trang đăng nhập').toHaveURL(`${env.baseURL}${loginPage.path}`);
        await expect(loginPage.formHeading, 'Biểu mẫu đăng nhập phải hiển thị lại').toBeVisible();
      });

      await test.step(`Assert: Đúng 1 dải "${invalidCredentials}", không vỡ ký tự`, async () => {
        await expect(loginPage.errorAlerts, 'Thông báo phải đúng nguyên văn tiếng Anh, không vỡ ký tự')
          .toHaveText([invalidCredentials]);
      });
    },
  );
});
