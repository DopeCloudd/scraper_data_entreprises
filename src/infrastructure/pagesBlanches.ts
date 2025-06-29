import { simulateHumanBehavior } from "@core/puppeteer";
import { randomDelay } from "@core/utils";
import { Page } from "puppeteer";

export async function findPhoneOnPagesBlanches(
  prenom: string,
  nom: string,
  ville: string,
  page: Page
): Promise<string> {
  try {
    console.log(`🔍 Recherche Pages Blanches pour ${prenom} ${nom}, ${ville}`);

    await page.goto("https://www.pagesjaunes.fr/pagesblanches", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await randomDelay(3000, 4000); // Attendre un peu pour simuler un comportement humain

    const iframeElementHandle = await page.$(
      'iframe[title="Fenêtre de consentement"]'
    );
    const frame = await iframeElementHandle?.contentFrame();

    if (frame) {
      // Vérifier que le contenu a été chargé
      await frame.waitForSelector(
        'button[aria-label="Accepter la collecte de vos données"]',
        { timeout: 5000 }
      );

      // Cliquer sur le bouton
      await frame.click(
        'button[aria-label="Accepter la collecte de vos données"]'
      );
    } else {
      console.log("⚠️ Aucune iframe de consentement trouvée, on continue");
    }

    // Remplir le champ "Nom"
    await page.waitForSelector("#quoiqui", { timeout: 10000 });
    await page.type("#quoiqui", `${prenom} ${nom}`, { delay: 50 });

    // Remplir le champ "Où"
    await page.type("#ou", ville, { delay: 50 });

    // Lancer la recherche
    await Promise.all([
      page.click("button#findId"),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }),
    ]);

    await simulateHumanBehavior(page);

    // Récupérer le premier numéro affiché
    const phone = await page.$$eval(".bi-contact-tel", (elements) => {
      const tel = elements[0]?.textContent?.trim();
      return tel || "";
    });

    if (phone) {
      console.log(`📞 Téléphone trouvé : ${phone}`);
      return phone;
    } else {
      console.log(`❌ Aucun numéro trouvé pour ${prenom} ${nom}`);
      return "";
    }
  } catch (err) {
    console.warn(`⚠️ Erreur Pages Blanches pour ${prenom} ${nom}:`, err);
    return "";
  }
}
