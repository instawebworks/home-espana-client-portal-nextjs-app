import en from "./locales/en";
import es from "./locales/es";
import de from "./locales/de";
import nl from "./locales/nl";

export const DEFAULT_LOCALE = "en";

export const DICTIONARIES = { en, es, de, nl };

// CRM picklist value -> portal locale. The CRM also offers French, Swedish,
// Norwegian and Other; those are deliberately absent so they fall back to
// English, per the agreed behaviour.
const CRM_LANGUAGE_TO_LOCALE = {
  English: "en",
  Spanish: "es",
  German: "de",
  Dutch: "nl",
};

export function getDictionary(locale) {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

// Zoho returns multi-selects as an array, single picklists as a string.
// Be liberal: some integrations write multi-selects back as "A;B".
function toList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(";");
  return [];
}

/**
 * Decide the portal language for a CRM record.
 *
 *   1. `Preferred_Language` (single-select) wins whenever a broker has set it —
 *      it is the deliberate, unambiguous override.
 *   2. Otherwise `Client_Language` (multi-select) decides, and English wins if
 *      it is among the tags: a client tagged English + Spanish is far more
 *      likely to be an English speaker who also has some Spanish than someone
 *      who needs a fully Spanish portal. English is the safe read either way.
 *   3. Multiple non-English tags with no English (rare) — first recognised one.
 *   4. Empty, unrecognised, or "-None-" → English.
 */
export function resolveLocale(crmRecord) {
  const preferredRaw =
    typeof crmRecord?.Preferred_Language === "string"
      ? crmRecord.Preferred_Language.trim()
      : "";
  const preferred = CRM_LANGUAGE_TO_LOCALE[preferredRaw];
  if (preferred) return preferred;

  const tagged = toList(crmRecord?.Client_Language)
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .map((v) => CRM_LANGUAGE_TO_LOCALE[v])
    .filter(Boolean);

  if (tagged.includes("en")) return "en";
  return tagged[0] ?? DEFAULT_LOCALE;
}
