import { getMiloTextCatalog } from "@/lib/mascot/catalog";

export interface MiloReviewCell {
  id: string;
  text: string;
}

export interface MiloReviewRow {
  rowKey: string;
  label: string;
  category: string;
  english: MiloReviewCell;
  hebrewMale: MiloReviewCell;
  hebrewFemale: MiloReviewCell;
}

export type MiloReviewStatus = "good" | "bad";

function heIdsFromEnId(enId: string): { male: string; female: string } {
  if (enId.startsWith("en:context:")) {
    const rest = enId.slice("en:context:".length);
    const lastColon = rest.lastIndexOf(":");
    const context = rest.slice(0, lastColon);
    const index = rest.slice(lastColon + 1);
    return {
      male: `he:context:${context}:male:${index}`,
      female: `he:context:${context}:female:${index}`,
    };
  }
  const key = enId.slice(3);
  return { male: `he:${key}:male`, female: `he:${key}:female` };
}

/** One row per Milo clip — English + Hebrew male + Hebrew female aligned. */
export function getMiloReviewRows(): MiloReviewRow[] {
  const catalog = getMiloTextCatalog();
  const byId = new Map(catalog.map((entry) => [entry.id, entry]));
  const english = catalog.filter((entry) => entry.locale === "en");

  return english.map((en) => {
    const { male, female } = heIdsFromEnId(en.id);
    const heMale = byId.get(male);
    const heFemale = byId.get(female);
    if (!heMale || !heFemale) {
      throw new Error(`Missing Hebrew lines for ${en.id}`);
    }

    return {
      rowKey: en.id.replace(/^en:/, ""),
      label: en.label,
      category: en.category,
      english: { id: en.id, text: en.text },
      hebrewMale: { id: heMale.id, text: heMale.text },
      hebrewFemale: { id: heFemale.id, text: heFemale.text },
    };
  });
}

export const MILO_REVIEW_STORAGE_KEY = "fun-school-milo-audio-review";
