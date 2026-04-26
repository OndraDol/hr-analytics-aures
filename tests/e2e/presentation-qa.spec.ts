import { expect, test, type Page, type TestInfo } from '@playwright/test';

const desktopRoutes = [
  { path: '/', title: /Executive přehled zdraví organizace/ },
  { path: '/akce', title: /Akční backlog/ },
  { path: '/briefing', title: /PDF podklad pro HR Directorku/ },
  { path: '/sekce/retention', title: /Retention/ },
  { path: '/analytika/recruitment-funnel', title: /Recruitment funnel|Náborový funnel/ },
  { path: '/operativa/esg', title: /ESG/ },
];

const mobileRoutes = [
  { path: '/', title: /Executive přehled zdraví organizace/ },
  { path: '/briefing', title: /PDF podklad pro HR Directorku/ },
  { path: '/akce', title: /Akční backlog/ },
];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-delay: 0s !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
      }
    `,
  });
});

test('desktop presentation routes render without viewport overflow', async ({ page }, testInfo) => {
  test.skip(!isDesktop(testInfo), 'Desktop QA runs only in the desktop project.');

  for (const route of desktopRoutes) {
    await openStable(page, route.path);
    await expect(page.getByText(route.title).first()).toBeVisible();
    await expect(page.getByText('HR Analytics').first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText("code: 'HR_STATS'");
    await expectNoHorizontalOverflow(page, route.path);
    await captureQaScreenshot(page, testInfo, `desktop-${slugFor(route.path)}.png`);
  }
});

test('mobile presentation routes expose compact navigation and fit the viewport', async ({ page }, testInfo) => {
  test.skip(!isMobile(testInfo), 'Mobile QA runs only in the mobile project.');

  for (const route of mobileRoutes) {
    await openStable(page, route.path);
    await expect(page.getByText(route.title).first()).toBeVisible();
    await expect(page.getByText('Navigace')).toBeVisible();
    await page.getByText('Navigace').click();
    await expect(page.getByRole('link', { name: /Executive/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /PDF briefing/ }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page, route.path);
    await captureQaScreenshot(page, testInfo, `mobile-${slugFor(route.path)}.png`);
  }
});

test('briefing print preview switches into A4-style preview mode', async ({ page }, testInfo) => {
  test.skip(!isDesktop(testInfo), 'Print preview QA runs only in the desktop project.');

  await openStable(page, '/briefing');
  await page.getByRole('button', { name: /Náhled tisku/ }).click();

  await expect(page.locator('html')).toHaveClass(/briefing-preview-mode/);
  await expect(page.locator('.briefing-page')).toBeVisible();
  await expect(page.getByRole('button', { name: /Vypnout náhled/ })).toBeVisible();
  await expectNoHorizontalOverflow(page, '/briefing preview');
  await captureQaScreenshot(page, testInfo, 'desktop-briefing-preview.png');
});

async function openStable(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.locator('main').first().waitFor({ state: 'visible' });
}

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const dimensions = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  const scrollWidth = Math.max(dimensions.bodyScrollWidth, dimensions.documentScrollWidth);

  expect(scrollWidth, `${label} should not overflow horizontally`).toBeLessThanOrEqual(
    dimensions.viewportWidth + 2,
  );
}

async function captureQaScreenshot(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({
    path: testInfo.outputPath(name),
    fullPage: true,
    animations: 'disabled',
  });
}

function isDesktop(testInfo: TestInfo): boolean {
  return testInfo.project.name.includes('desktop');
}

function isMobile(testInfo: TestInfo): boolean {
  return testInfo.project.name.includes('mobile');
}

function slugFor(path: string): string {
  return path === '/' ? 'home' : path.replace(/^\//, '').replaceAll('/', '-');
}
