import { sendMail } from "@infra/mailer";
import { readExcelFile } from "@infra/reader";
import { createXlsx } from "@infra/writer";
import { processEntreprises } from "@services/scraperService";
import dotenv from "dotenv";
import path from "path";

// Charger les variables d’environnement (.env)
dotenv.config();

async function main() {
  const inputPath = path.join(
    __dirname,
    "..",
    "data",
    "creation organisme de formation de mars a avril 2025 (1).xlsx"
  );

  // Vérifier si le fichier d'entrée existe
  console.log("📥 Lecture du fichier Excel...");
  const rawList = readExcelFile(inputPath);
  console.log(`✅ ${rawList.length} entreprises valides trouvées`);

  // Lancer le traitement des entreprises
  console.log("🚀 Début du traitement Pappers...");
  const enrichedList = await processEntreprises(rawList.slice(0, 1));

  // Exporter les résultats dans un fichier Excel
  console.log("📊 Génération du fichier Excel...");
  const xlsxPath = await createXlsx(enrichedList);

  // Envoyer le mail avec le fichier Excel en pièce jointe
  await sendMail(xlsxPath);
  console.log("✅ Traitement terminé avec succès !");
  console.log("📂 Fichier exporté dans le dossier 'export' avec succès !");
}

main().catch((err) => {
  console.error("❌ Erreur fatale :", err);
});
