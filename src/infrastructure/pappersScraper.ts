import { retryGoto, simulateHumanBehavior } from "@core/puppeteer";
import { EnrichedEntreprise, RawEntreprise } from "@core/types";
import { Page } from "puppeteer";

/**
 * Scrape les informations dirigeant depuis la recherche Pappers.
 */
export async function scrapePappersInfo(
  raw: RawEntreprise,
  page: Page
): Promise<Partial<EnrichedEntreprise>> {
  const searchUrl = `https://www.pappers.fr/recherche?q=${raw.siret}`;

  const success = await retryGoto(page, searchUrl);
  if (!success) {
    console.warn(`⛔ Redirection échouée pour ${raw.siret}`);
    return {};
  }

  const finalUrl = page.url();
  if (!finalUrl.includes("/entreprise/")) {
    console.warn(
      `⛔ Pas de redirection vers une page entreprise pour ${raw.siret}`
    );
    return {};
  }

  await page.waitForSelector("h1", { timeout: 10000 });

  await simulateHumanBehavior(page); // Simule un comportement humain pour éviter les blocages

  const info = await page.evaluate(() => {
    const result: any = {};

    // 👤 Dirigeant
    const link = document.querySelector("td.info-dirigeant a");
    if (link && link.textContent) {
      const fullName = link.textContent.trim();
      const parts = fullName.split(" ");
      if (parts.length >= 2) {
        result.nom = parts[0];
        result.prenom = parts.slice(1).join(" ");
      } else {
        result.nom = fullName;
      }
    }

    // 🏠 Adresse
    const rows = Array.from(document.querySelectorAll("tr"));
    for (const row of rows) {
      const th = row.querySelector("th");
      if (th?.textContent?.trim() === "Adresse :") {
        const td = row.querySelector("td");
        if (td) {
          result.adresse = td.textContent?.trim();
        }
      }
    }

    return result;
  });

  return {
    nom: info.nom,
    prenom: info.prenom,
    adresse: info.adresse,
  };
}
