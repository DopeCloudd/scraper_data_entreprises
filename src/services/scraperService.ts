import { initBrowser, initPage } from "@core/puppeteer";
import { EnrichedEntreprise, RawEntreprise } from "@core/types";
import { randomDelay } from "@core/utils";
import { findLinkedInProfile } from "@infra/linkedinFinder";
import { findPhoneOnPagesBlanches } from "@infra/pagesBlanches";
import { scrapePappersInfo } from "@infra/pappersScraper";

/**
 * Traite la liste des entreprises en les enrichissant depuis Pappers.
 */
export async function processEntreprises(
  rawList: RawEntreprise[]
): Promise<EnrichedEntreprise[]> {
  const results: EnrichedEntreprise[] = [];

  const browser = await initBrowser();

  for (let i = 0; i < rawList.length; i++) {
    const raw = rawList[i];
    console.log(
      `🔎 [${i + 1}/${rawList.length}] ${raw.denominationUniteLegale} (${
        raw.siret
      })`
    );

    const page = await initPage(browser);

    try {
      // Scrape les infos de dirigeant via Pappers
      const scraped = await scrapePappersInfo(raw, page);

      await randomDelay(3000, 6000); // delay entre 3 et 6 secondes

      // Recherche du profil LinkedIn
      const linkedin = await findLinkedInProfile(
        scraped.prenom || "",
        scraped.nom || "",
        raw.libelleCommuneEtablissement || "",
        page
      );

      await randomDelay(3000, 6000); // delay entre 3 et 6 secondes

      const phone = await findPhoneOnPagesBlanches(
        scraped.prenom || "",
        scraped.nom || "",
        raw.libelleCommuneEtablissement || "",
        page
      );

      results.push({
        siret: raw.siret,
        denomination: raw.denominationUniteLegale,
        adresse: scraped.adresse || "",
        nom: scraped.nom || "",
        prenom: scraped.prenom || "",
        linkedinUrl: linkedin,
        telephone: phone,
      });
    } catch (err) {
      console.error(`❌ Échec pour ${raw.siret} :`, err);
    } finally {
      await page.close();
    }
    await randomDelay(3000, 6000); // delay entre 3 et 6 secondes
  }

  await browser.close();

  return results;
}
