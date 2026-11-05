/**
 * The analysis assistant's "brain": four fixed, deterministic analyses over the demo datasets.
 *
 * There is no language model behind it. A typed question is matched against a small vocabulary (Arabic, French,
 * English) and mapped to one of the analyses below; anything else is reported as unsupported. Every figure is
 * computed from the records passed in, so it always agrees with the pages that show the same records.
 *
 * The functions are pure and language-neutral: they return ids and numbers, and `assistantView.ts` turns them into
 * translated text.
 */
import { ASSISTANT_VOCAB, normalizeQuestion } from '@/i18n/assistantVocab';
import { weightedCollectionRate } from '@/lib/dashboardStats';

export const ASSISTANT_INTENTS = ['criticalSpots', 'urgentContainers', 'municipalityPerformance', 'spotConcentration'] as const;
export type AssistantIntent = (typeof ASSISTANT_INTENTS)[number];

/** Containers filled above this percentage need emptying urgently (the demo data marks them as `full`). */
export const URGENT_FILL_PERCENT = 90;

const OPEN_STATUSES: ReadonlySet<string> = new Set(['open', 'inProgress']);
const TOP_MUNICIPALITIES = 3;

export interface SpotLike { municipalityId: string; status: string; priority: string }
export interface ContainerLike { code: string; municipalityId: string; fillLevel: number }
export interface MunicipalityLike { id: string; containers: number; collectionRate: number }

export interface AssistantData {
  spots: readonly SpotLike[];
  containers: readonly ContainerLike[];
  municipalities: readonly MunicipalityLike[];
}

export interface MunicipalityCount { id: string; count: number }
export interface MunicipalityShare extends MunicipalityCount { percent: number }
export interface MunicipalityRate { id: string; rate: number }
export interface UrgentContainer { code: string; municipalityId: string; fill: number }

export type AssistantAnswer =
  | {
      intent: 'criticalSpots';
      total: number;
      /** Spots that are still `open` or `inProgress`. */
      unresolved: number;
      /** Unresolved spots with critical priority. */
      critical: number;
      /** Critical share of the unresolved spots, rounded; 0 when nothing is unresolved. */
      percent: number;
      /** Unresolved critical spots per municipality, most first. */
      byMunicipality: MunicipalityCount[];
    }
  | {
      intent: 'urgentContainers';
      total: number;
      over: number;
      threshold: number;
      /** Mean fill level of all containers, rounded. */
      average: number;
      /** Containers above the threshold, fullest first. */
      urgent: UrgentContainer[];
    }
  | {
      intent: 'municipalityPerformance';
      /** Collection rate averaged over municipalities and weighted by their container count. */
      weightedRate: number;
      count: number;
      /** Every municipality, highest collection rate first. */
      ranking: MunicipalityRate[];
      best: MunicipalityRate[];
      /** Lowest rate first. */
      worst: MunicipalityRate[];
    }
  | {
      intent: 'spotConcentration';
      unresolved: number;
      /** Number of municipalities with at least one unresolved spot. */
      affected: number;
      /** Unresolved spots per municipality, most first. */
      byMunicipality: MunicipalityShare[];
    };

/** Maps a typed question to an analysis, or null when it is not one the assistant supports. */
export function detectIntent(question: string): AssistantIntent | null {
  const q = normalizeQuestion(question);
  const has = (group: keyof typeof ASSISTANT_VOCAB) => ASSISTANT_VOCAB[group].some((re) => re.test(q));
  if (has('spots') && has('where')) return 'spotConcentration';
  if (has('spots')) return 'criticalSpots';
  if (has('containers')) return 'urgentContainers';
  if (has('performance')) return 'municipalityPerformance';
  return null;
}

function countBy(ids: readonly string[]): MunicipalityCount[] {
  const counts = new Map<string, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

const percentOf = (part: number, whole: number): number => (whole > 0 ? Math.round((part / whole) * 100) : 0);

export function runAssistant(intent: AssistantIntent, data: AssistantData): AssistantAnswer {
  switch (intent) {
    case 'criticalSpots': {
      const unresolved = data.spots.filter((s) => OPEN_STATUSES.has(s.status));
      const critical = unresolved.filter((s) => s.priority === 'critical');
      return {
        intent,
        total: data.spots.length,
        unresolved: unresolved.length,
        critical: critical.length,
        percent: percentOf(critical.length, unresolved.length),
        byMunicipality: countBy(critical.map((s) => s.municipalityId)),
      };
    }
    case 'urgentContainers': {
      const urgent = data.containers
        .filter((c) => c.fillLevel > URGENT_FILL_PERCENT)
        .sort((a, b) => b.fillLevel - a.fillLevel || a.code.localeCompare(b.code))
        .map((c) => ({ code: c.code, municipalityId: c.municipalityId, fill: c.fillLevel }));
      const total = data.containers.length;
      const sum = data.containers.reduce((s, c) => s + c.fillLevel, 0);
      return { intent, total, over: urgent.length, threshold: URGENT_FILL_PERCENT, average: total ? Math.round(sum / total) : 0, urgent };
    }
    case 'municipalityPerformance': {
      const ranking = data.municipalities
        .map((m) => ({ id: m.id, rate: m.collectionRate }))
        .sort((a, b) => b.rate - a.rate || a.id.localeCompare(b.id));
      // Never show the same municipality as both best and worst.
      const k = Math.min(TOP_MUNICIPALITIES, Math.floor(ranking.length / 2));
      return {
        intent,
        weightedRate: weightedCollectionRate(data.municipalities),
        count: ranking.length,
        ranking,
        best: ranking.slice(0, k),
        worst: ranking.slice(ranking.length - k).reverse(),
      };
    }
    case 'spotConcentration': {
      const unresolved = data.spots.filter((s) => OPEN_STATUSES.has(s.status));
      const byMunicipality = countBy(unresolved.map((s) => s.municipalityId))
        .map((r) => ({ ...r, percent: percentOf(r.count, unresolved.length) }));
      return { intent, unresolved: unresolved.length, affected: byMunicipality.length, byMunicipality };
    }
  }
}
