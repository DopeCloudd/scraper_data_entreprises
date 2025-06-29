export interface RawEntreprise {
  siret: string;
  denominationUniteLegale: string;
  libelleCommuneEtablissement?: string;
  codePostalEtablissement?: string;
}

export interface EnrichedEntreprise {
  siret: string;
  denomination: string;
  nom?: string;
  prenom?: string;
  adresse?: string;
  linkedinUrl?: string;
  telephone?: string;
}
