import { EnrichedEntreprise } from "@core/types";
import path from "path";
import * as XLSX from "xlsx";

export async function createXlsx(data: EnrichedEntreprise[]): Promise<string> {
  // 2️⃣ Générer la worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 3️⃣ Générer le workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Données");

  // 4️⃣ Générer le timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `export_${timestamp}.xlsx`;
  const outputPath = path.join(process.cwd(), "export", fileName);

  // 5️⃣ Écrire le fichier Excel
  XLSX.writeFile(workbook, outputPath);
  console.log("✅ Fichier Excel généré:", outputPath);

  return outputPath;
}
