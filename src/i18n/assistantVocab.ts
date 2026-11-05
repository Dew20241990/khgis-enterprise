/**
 * Vocabulary the local analysis assistant uses to recognise a typed question in Arabic, French or English.
 *
 * It is language data rather than UI text, so it lives under src/i18n/. Patterns are matched against the output of
 * `normalizeQuestion`: lower-case, Latin accents and Arabic diacritics/hamza marks removed, ta marbuta -> ha,
 * alef maksura -> ya. There is no language model: a question either matches one of these groups or it is unsupported.
 */
export function normalizeQuestion(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ًͯ-ٰٟ]/g, '') // Latin accents, Arabic diacritics, hamza/madda marks
    .replace(/ى/g, 'ي') // alef maksura -> ya
    .replace(/ة/g, 'ه') // ta marbuta -> ha
    .replace(/\s+/g, ' ')
    .trim();
}

export const ASSISTANT_VOCAB = {
  /** "black spots": النقاط السوداء / points noirs / black spots */
  spots: [/(نقاط|نقطه|نقط)\s*(ال)?سود/, /points?\s+noirs?/, /black\s*spots?/],
  /** containers and bins */
  containers: [/حاوي/, /conteneur/, /\bbacs?\b/, /\bbennes?\b/, /container/, /\bbins?\b/],
  /** "where / concentrated / distribution" */
  where: [/(^|\s)اين(\s|$)|تركز|توزع|توزيع/, /concentr|reparti|distribution|ou (sont|se|est)\b/, /where|distribut/],
  /** "performance / report / ranking" */
  performance: [/اداء|تقرير|ترتيب/, /performance|rapport|classement/, /performance|report|ranking/],
} as const satisfies Record<string, readonly RegExp[]>;
