export function normalizeAiFeatures(raw: any): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(item => String(item || "").trim())
    .filter(item => item.length > 0);
}

export function normalizeAiPrompt(raw: any): string {
  if (typeof raw !== "string") return String(raw || "").trim();
  return raw.trim();
}
