import { simulateHumanBehavior } from "@core/puppeteer";
import { randomDelay } from "@core/utils";
import { Page } from "puppeteer";

/**
 * Recherche un profil LinkedIn correspondant au dirigeant.
 */
export async function findLinkedInProfile(
  prenom: string,
  nom: string,
  ville: string,
  page: Page
): Promise<string> {
  const query = [
    `${prenom}`,
    `${nom.toLowerCase()}`,
    `${ville.toLowerCase()}`,
    "linkedin",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    await page.goto("https://www.google.fr", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Vérifie et clique sur le bouton "Tout accepter" si présent
    const acceptCookiesSelector = "button#L2AGLb";
    const hasCookiesButton = await page.$(acceptCookiesSelector);
    if (hasCookiesButton) {
      await Promise.all([page.click(acceptCookiesSelector)]);
    }

    await randomDelay(1000, 1000);
    await page.waitForSelector("textarea[name='q']", { timeout: 10000 });

    // taper la requête comme un humain
    await page.type("textarea[name='q']", query, { delay: 100 });
    await page.keyboard.press("Enter");

    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: 15000,
    });
    await simulateHumanBehavior(page);

    const links = await page.$$eval("a", (anchors) =>
      anchors
        .map((a) => ({
          href: a.href,
          text: a.textContent?.toLowerCase() || "",
        }))
        .filter((a) => a.href.includes("linkedin.com"))
        .map((a) => a.href)
    );

    return links.length > 0 ? links[0] : "";
  } catch (err) {
    console.warn(`⚠️ Erreur LinkedIn pour ${prenom} ${nom} :`, err);
    return "";
  }
}
