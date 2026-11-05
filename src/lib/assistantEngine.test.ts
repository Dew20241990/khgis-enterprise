import { describe, expect, it } from 'vitest';
import { blackSpots, containers, municipalities } from '@/data/mockData';
import { normalizeQuestion } from '@/i18n/assistantVocab';
import { weightedCollectionRate } from './dashboardStats';
import {
  ASSISTANT_INTENTS, URGENT_FILL_PERCENT, detectIntent, runAssistant,
  type AssistantAnswer, type AssistantData, type AssistantIntent,
} from './assistantEngine';

function answerOf<I extends AssistantIntent>(intent: I, data: AssistantData): Extract<AssistantAnswer, { intent: I }> {
  return runAssistant(intent, data) as Extract<AssistantAnswer, { intent: I }>;
}

/** Small hand-countable dataset. */
const small: AssistantData = {
  spots: [
    { municipalityId: 'A', status: 'open', priority: 'critical' },
    { municipalityId: 'A', status: 'inProgress', priority: 'critical' },
    { municipalityId: 'B', status: 'open', priority: 'critical' },
    { municipalityId: 'B', status: 'resolved', priority: 'critical' }, // resolved: not counted
    { municipalityId: 'B', status: 'open', priority: 'low' },
    { municipalityId: 'C', status: 'closed', priority: 'critical' }, // closed: not counted
  ],
  containers: [
    { code: 'C-1', municipalityId: 'A', fillLevel: 95 },
    { code: 'C-2', municipalityId: 'B', fillLevel: 91 },
    { code: 'C-3', municipalityId: 'B', fillLevel: 90 }, // exactly the threshold is not "above" it
    { code: 'C-4', municipalityId: 'A', fillLevel: 20 },
  ],
  municipalities: [
    { id: 'A', containers: 100, collectionRate: 90 },
    { id: 'B', containers: 100, collectionRate: 70 },
    { id: 'C', containers: 200, collectionRate: 80 },
    { id: 'D', containers: 0, collectionRate: 60 },
  ],
};

const real: AssistantData = { spots: blackSpots, containers, municipalities };
const EMPTY: AssistantData = { spots: [], containers: [], municipalities: [] };

describe('detectIntent', () => {
  it.each([
    ['حلّل النقاط السوداء الحرجة المفتوحة', 'criticalSpots'],
    ['أين تتركز النقاط السوداء؟', 'spotConcentration'],
    ['أي الحاويات تحتاج تفريغاً عاجلاً؟', 'urgentContainers'],
    ['ولّد تقرير أداء البلديات', 'municipalityPerformance'],
    ['Analyser les points noirs critiques ouverts', 'criticalSpots'],
    ['Où se concentrent les points noirs ?', 'spotConcentration'],
    ['Quels conteneurs doivent être vidés d’urgence ?', 'urgentContainers'],
    ['Générer un rapport de performance des communes', 'municipalityPerformance'],
    ['Analyse the open critical black spots', 'criticalSpots'],
    ['Where are the black spots concentrated?', 'spotConcentration'],
    ['Which containers need urgent emptying?', 'urgentContainers'],
    ['Generate a municipality performance report', 'municipalityPerformance'],
    ['containers', 'urgentContainers'],
    ['نقاط سوداء', 'criticalSpots'],
  ] as const)('maps "%s" to %s', (question, expected) => {
    expect(detectIntent(question)).toBe(expected);
  });

  it('every suggested question of the page is understood in all three languages', () => {
    // The suggestions are the page's own question texts; typing them must give the same analysis as clicking them.
    const questions: Record<AssistantIntent, string[]> = {
      criticalSpots: ['حلّل النقاط السوداء الحرجة المفتوحة', 'Analyser les points noirs critiques ouverts', 'Analyse the open critical black spots'],
      urgentContainers: ['أي الحاويات تحتاج تفريغاً عاجلاً؟', 'Quels conteneurs doivent être vidés d’urgence ?', 'Which containers need urgent emptying?'],
      municipalityPerformance: ['ولّد تقرير أداء البلديات', 'Générer un rapport de performance des communes', 'Generate a municipality performance report'],
      spotConcentration: ['أين تتركز النقاط السوداء؟', 'Où se concentrent les points noirs ?', 'Where are the black spots concentrated?'],
    };
    for (const intent of ASSISTANT_INTENTS) for (const q of questions[intent]) expect(detectIntent(q)).toBe(intent);
  });

  it('returns null for anything it cannot analyse instead of guessing', () => {
    for (const q of ['', '   ', 'what is the weather today?', 'مرحبا', 'bonjour', 'tell me a joke']) {
      expect(detectIntent(q)).toBeNull();
    }
  });

  it('normalises accents, diacritics and letter variants', () => {
    expect(normalizeQuestion('  Où   SE  ')).toBe('ou se');
    expect(normalizeQuestion('أَين')).toBe('اين');
    expect(normalizeQuestion('الحرجة')).toBe('الحرجه');
  });
});

describe('runAssistant on a hand-countable dataset', () => {
  it('criticalSpots counts only unresolved critical spots', () => {
    const a = answerOf('criticalSpots', small);
    expect(a).toMatchObject({ total: 6, unresolved: 4, critical: 3, percent: 75 });
    expect(a.byMunicipality).toEqual([{ id: 'A', count: 2 }, { id: 'B', count: 1 }]);
  });

  it('urgentContainers uses "strictly above the threshold" and sorts the fullest first', () => {
    const a = answerOf('urgentContainers', small);
    expect(a.threshold).toBe(URGENT_FILL_PERCENT);
    expect(a).toMatchObject({ total: 4, over: 2, average: 74 });
    expect(a.urgent).toEqual([
      { code: 'C-1', municipalityId: 'A', fill: 95 },
      { code: 'C-2', municipalityId: 'B', fill: 91 },
    ]);
  });

  it('municipalityPerformance weights by container count and never lists a municipality as both best and worst', () => {
    const a = answerOf('municipalityPerformance', small);
    expect(a.weightedRate).toBe(80); // (90*100 + 70*100 + 80*200 + 60*0) / 400
    expect(a.ranking.map((r) => r.id)).toEqual(['A', 'C', 'B', 'D']);
    expect(a.best.map((r) => r.id)).toEqual(['A', 'C']);
    expect(a.worst.map((r) => r.id)).toEqual(['D', 'B']); // lowest first
    const single = answerOf('municipalityPerformance', { ...EMPTY, municipalities: [small.municipalities[0]] });
    expect(single.best).toEqual([]);
    expect(single.worst).toEqual([]);
  });

  it('spotConcentration groups unresolved spots per municipality with percentages', () => {
    const a = answerOf('spotConcentration', small);
    expect(a).toMatchObject({ unresolved: 4, affected: 2 });
    expect(a.byMunicipality).toEqual([{ id: 'A', count: 2, percent: 50 }, { id: 'B', count: 2, percent: 50 }]);
  });

  it('handles empty data without NaN or crashes', () => {
    expect(answerOf('criticalSpots', EMPTY)).toMatchObject({ total: 0, unresolved: 0, critical: 0, percent: 0, byMunicipality: [] });
    expect(answerOf('urgentContainers', EMPTY)).toMatchObject({ total: 0, over: 0, average: 0, urgent: [] });
    expect(answerOf('municipalityPerformance', EMPTY)).toMatchObject({ weightedRate: 0, count: 0, best: [], worst: [] });
    expect(answerOf('spotConcentration', EMPTY)).toMatchObject({ unresolved: 0, affected: 0, byMunicipality: [] });
  });
});

describe('runAssistant on the demo datasets (the figures other pages show)', () => {
  it('criticalSpots agrees with the black-spot records', () => {
    const a = answerOf('criticalSpots', real);
    expect(a.total).toBe(blackSpots.length);
    expect(a.unresolved).toBe(blackSpots.filter((s) => s.status === 'open' || s.status === 'inProgress').length);
    expect(a.critical).toBe(blackSpots.filter((s) => (s.status === 'open' || s.status === 'inProgress') && s.priority === 'critical').length);
    expect(a.byMunicipality.reduce((sum, r) => sum + r.count, 0)).toBe(a.critical);
  });

  it('urgentContainers lists exactly the containers the Containers page marks as full', () => {
    const a = answerOf('urgentContainers', real);
    expect(a.total).toBe(containers.length);
    expect(a.over).toBe(containers.filter((c) => c.status === 'full').length);
    expect(a.urgent.map((c) => c.code).sort()).toEqual(containers.filter((c) => c.status === 'full').map((c) => c.code).sort());
  });

  it('municipalityPerformance uses the same weighted rate as the dashboard and covers every municipality', () => {
    const a = answerOf('municipalityPerformance', real);
    expect(a.weightedRate).toBe(weightedCollectionRate(municipalities));
    expect(a.count).toBe(municipalities.length);
    expect(a.ranking).toHaveLength(21);
  });

  it('spotConcentration shares add up to roughly 100 and never exceed the municipality count', () => {
    const a = answerOf('spotConcentration', real);
    expect(a.byMunicipality.reduce((sum, r) => sum + r.count, 0)).toBe(a.unresolved);
    expect(a.affected).toBeLessThanOrEqual(municipalities.length);
  });

  it('is deterministic: the same data always gives the same answer', () => {
    for (const intent of ASSISTANT_INTENTS) expect(runAssistant(intent, real)).toEqual(runAssistant(intent, real));
  });
});
