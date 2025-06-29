import { RawEntreprise } from "@core/types";
import * as XLSX from "xlsx";

export function readExcelFile(filePath: string): RawEntreprise[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data: any[] = XLSX.utils.sheet_to_json(sheet);

  return data
    .filter((row) => {
      const denom = String(row.denominationUniteLegale || "").trim();
      const isValid = denom && denom !== "[ND]";
      return isValid;
    })
    .map((row) => ({
      siret: String(row.siret),
      denominationUniteLegale: String(row.denominationUniteLegale || "").trim(),
      libelleCommuneEtablissement: String(
        row.libelleCommuneEtablissement || ""
      ).trim(),
      codePostalEtablissement: String(row.codePostalEtablissement || "").trim(),
    }));
}
