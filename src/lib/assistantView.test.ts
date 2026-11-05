import { describe, expect, it } from 'vitest';
import { blackSpots, containers, municipalities } from '@/data/mockData';
import { translate, type Locale } from '@/i18n/translations';
import { localizedName } from './localized';
import { ASSISTANT_INTENTS, runAssistant, type AssistantData } from './assistantEngine';
import { viewAnswer, type AnswerView, type Translate } from './assistantView';

const LOCALES: Locale[] = ['ar', 'fr', 'en'];
const real: AssistantData = { spots: blackSpots, containers, municipalities };
const small: AssistantData = {
  spots: [],
  containers: [
    { code: 'C-1', municipalityId: 'A', fillLevel: 95 },
    { code: 'C-2', municipalityId: 'B', fillLevel: 91 },
    { code: 'C-3', municipalityId: 'B', fillLevel: 90 },
    { code: 'C-4', municipalityId: 'A', fillLevel: 20 },
  ],
  municipalities: [],
};

const tFor = (locale: Locale): Translate => (key, params) => translate(locale, key, params);
const nameFor = (locale: Locale) => (id: string) => localizedName(locale, municipalities.find((m) => m.id === id)) || id;
const viewFor = (locale: Locale, intent: (typeof ASSISTANT_INTENTS)[number], data = real): AnswerView =>
  viewAnswer(runAssistant(intent, data), tFor(locale), locale, nameFor(locale));

const textOf = (v: AnswerView) => [v.intro, ...v.cards.flatMap((c) => [c.title, c.desc]), ...(v.table ? [...v.table.headers, ...v.table.rows.flat().map(String)] : [])];
const ARABIC = /[؀-ۿ]/;

describe('viewAnswer', () => {
  it.each(LOCALES.flatMap((locale) => ASSISTANT_INTENTS.map((intent) => [locale, intent] as const)))(
    '%s / %s: no unresolved placeholders and a rectangular table',
    (locale, intent) => {
      const v = viewFor(locale, intent);
      for (const text of textOf(v)) expect(text).not.toMatch(/[{}]/);
      expect(v.intro.length).toBeGreaterThan(10);
      expect(v.cards.length).toBeGreaterThan(0);
      if (v.table) for (const row of v.table.rows) expect(row).toHaveLength(v.table.headers.length);
    },
  );

  it.each(['fr', 'en'] as const)('%s output contains no Arabic text, including municipality names', (locale) => {
    for (const intent of ASSISTANT_INTENTS) for (const text of textOf(viewFor(locale, intent))) expect(text).not.toMatch(ARABIC);
  });

  it('Arabic output is Arabic', () => {
    for (const intent of ASSISTANT_INTENTS) expect(viewFor('ar', intent).intro).toMatch(ARABIC);
  });

  it('reports urgent containers with exact, countable wording (English)', () => {
    const v = viewFor('en', 'urgentContainers', small);
    expect(v.intro).toBe('4 containers checked; average fill level 74%.');
    expect(v.cards).toHaveLength(1);
    expect(v.cards[0].title).toBe('2 containers are above 90% full');
    expect(v.cards[0].desc).toBe('Empty first: C-1 · A (95%), C-2 · B (91%)');
    expect(v.table?.rows).toEqual([['C-1', 'A', 95], ['C-2', 'B', 91]]);
  });

  it('says so when there is nothing to report instead of inventing a finding', () => {
    const none: AssistantData = { spots: [], containers: [{ code: 'C-1', municipalityId: 'A', fillLevel: 10 }], municipalities: [] };
    const urgent = viewFor('en', 'urgentContainers', none);
    expect(urgent.cards[0].title).toBe('No container is above 90% full');
    expect(urgent.table).toBeNull();
    const spots = viewFor('en', 'criticalSpots', none);
    expect(spots.cards.map((c) => c.id)).toEqual(['none']);
    expect(spots.table).toBeNull();
    expect(viewFor('en', 'spotConcentration', none).cards.map((c) => c.id)).toEqual(['none']);
  });

  it('the figures in the text come from the computed answer', () => {
    const answer = runAssistant('urgentContainers', real);
    if (answer.intent !== 'urgentContainers') throw new Error('unexpected intent');
    const v = viewAnswer(answer, tFor('en'), 'en', nameFor('en'));
    expect(v.intro).toContain(`${answer.total} containers checked`);
    expect(v.cards[0].title).toContain(`${answer.over} containers`);
    expect(v.table?.rows).toHaveLength(answer.over);
  });
});
