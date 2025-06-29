import { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
];

const getRandomViewport = () => ({
  width: Math.floor(Math.random() * (1440 - 1280) + 1280),
  height: Math.floor(Math.random() * (900 - 720) + 720),
});

export async function initBrowser(): Promise<Browser> {
  return puppeteer.use(StealthPlugin()).launch({
    headless: false,
    ignoreDefaultArgs: ["--enable-automation"],
    args: ["--no-sandbox"],
  });
}

export async function initPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  await page.setUserAgent(userAgent);
  await page.setViewport(getRandomViewport());

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, "languages", {
      get: () => ["fr-FR", "fr", "en-US", "en"],
    });
    Object.defineProperty(navigator, "maxTouchPoints", { get: () => 1 });

    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters: any): Promise<any> =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: "denied" })
        : originalQuery(parameters);

    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (parameter) {
      if (parameter === 37445) return "NVIDIA";
      if (parameter === 37446) return "GTX 1080";
      return getParameter(parameter);
    };
  });

  return page;
}

export async function simulateHumanBehavior(page: Page) {
  await page.evaluate(() => {
    const scrollAmount = Math.floor(Math.random() * 200) + 50;
    window.scrollBy(0, scrollAmount);
  });

  const x = Math.floor(Math.random() * 200) + 50;
  const y = Math.floor(Math.random() * 200) + 50;
  await page.mouse.move(x, y);
  await page.click("body");
}

export async function retryGoto(
  page: Page,
  url: string,
  retries = 3
): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      });
      return true;
    } catch (err) {
      console.warn(`⚠️ Tentative ${i + 1} échouée pour ${url}`);
      if (i < retries - 1) await new Promise((res) => setTimeout(res, 10000));
    }
  }
  console.error(`❌ Impossible de charger ${url} après ${retries} tentatives.`);
  return false;
}
