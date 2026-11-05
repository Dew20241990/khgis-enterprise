/**
 * Turns a language-neutral `AssistantAnswer` into translated text, summary cards and an exportable table.
 * Nothing here is stored: the chat keeps the structured answer and re-renders it, so switching language relabels
 * every earlier answer.
 */
import type { Locale, TranslationKey } from '@/i18n/translations';
import { formatNumber } from '@/lib/format';
import type { AssistantAnswer } from '@/lib/assistantEngine';

export type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string;

export type CardTone = 'danger' | 'warning' | 'success';
export interface AnswerCard {
  id: string;
  kind: 'alert' | 'stat' | 'insight';
  tone: CardTone;
  title: string;
  desc: string;
}
export interface AnswerTable { headers: string[]; rows: (string | number)[][] }
export interface AnswerView { intro: string; cards: AnswerCard[]; table: AnswerTable | null }

const LIST_LIMIT_CONTAINERS = 5;
const LIST_LIMIT_MUNICIPALITIES = 3;

export function viewAnswer(
  answer: AssistantAnswer,
  t: Translate,
  locale: Locale,
  nameOf: (municipalityId: string) => string,
): AnswerView {
  const n = (v: number) => formatNumber(locale, v);
  const join = (items: string[]) => items.join(t('assistant.listSep'));
  const tableOf = (headers: string[], rows: (string | number)[][]): AnswerTable | null => (rows.length ? { headers, rows } : null);

  switch (answer.intent) {
    case 'criticalSpots': {
      const cards: AnswerCard[] = [];
      if (answer.critical > 0) {
        const top = answer.byMunicipality.slice(0, LIST_LIMIT_MUNICIPALITIES).map((r) => `${nameOf(r.id)} (${n(r.count)})`);
        cards.push({
          id: 'count', kind: 'alert', tone: 'danger',
          title: t('assistant.a.criticalSpots.countTitle', { critical: n(answer.critical) }),
          desc: t('assistant.a.criticalSpots.countDesc', { list: join(top) }),
        });
      } else {
        cards.push({
          id: 'none', kind: 'insight', tone: 'success',
          title: t('assistant.a.criticalSpots.noneTitle'), desc: t('assistant.a.criticalSpots.noneDesc'),
        });
      }
      if (answer.unresolved > 0) {
        cards.push({
          id: 'share', kind: 'stat', tone: 'warning',
          title: t('assistant.a.criticalSpots.shareTitle', { percent: n(answer.percent) }),
          desc: t('assistant.a.criticalSpots.shareDesc', { critical: n(answer.critical), unresolved: n(answer.unresolved) }),
        });
      }
      return {
        intro: t('assistant.a.criticalSpots.intro', { total: n(answer.total), unresolved: n(answer.unresolved), critical: n(answer.critical) }),
        cards,
        table: tableOf([t('municipality'), t('assistant.col.criticalSpots')], answer.byMunicipality.map((r) => [nameOf(r.id), r.count])),
      };
    }
    case 'urgentContainers': {
      const card: AnswerCard = answer.over > 0
        ? {
            id: 'over', kind: 'stat', tone: 'warning',
            title: t('assistant.a.urgentContainers.overTitle', { over: n(answer.over), threshold: n(answer.threshold) }),
            desc: t('assistant.a.urgentContainers.overDesc', {
              list: join(answer.urgent.slice(0, LIST_LIMIT_CONTAINERS).map((c) => `${c.code} · ${nameOf(c.municipalityId)} (${n(c.fill)}%)`)),
            }),
          }
        : {
            id: 'none', kind: 'insight', tone: 'success',
            title: t('assistant.a.urgentContainers.noneTitle', { threshold: n(answer.threshold) }),
            desc: t('assistant.a.urgentContainers.noneDesc'),
          };
      return {
        intro: t('assistant.a.urgentContainers.intro', { total: n(answer.total), average: n(answer.average) }),
        cards: [card],
        table: tableOf(
          [t('assistant.col.code'), t('municipality'), t('assistant.col.fillPercent')],
          answer.urgent.map((c) => [c.code, nameOf(c.municipalityId), c.fill]),
        ),
      };
    }
    case 'municipalityPerformance': {
      const describe = (rows: { id: string; rate: number }[]) => join(rows.map((r) => `${nameOf(r.id)} (${n(r.rate)}%)`));
      const cards: AnswerCard[] = [];
      if (answer.best.length > 0) {
        cards.push({
          id: 'best', kind: 'insight', tone: 'success',
          title: t('assistant.a.municipalityPerformance.bestTitle'), desc: describe(answer.best),
        });
        cards.push({
          id: 'worst', kind: 'stat', tone: 'warning',
          title: t('assistant.a.municipalityPerformance.worstTitle'), desc: describe(answer.worst),
        });
      }
      return {
        intro: t('assistant.a.municipalityPerformance.intro', { rate: n(answer.weightedRate), count: n(answer.count) }),
        cards,
        table: tableOf([t('municipality'), t('assistant.col.collectionRate')], answer.ranking.map((r) => [nameOf(r.id), r.rate])),
      };
    }
    case 'spotConcentration': {
      const cards: AnswerCard[] = answer.unresolved > 0
        ? answer.byMunicipality.slice(0, LIST_LIMIT_MUNICIPALITIES).map((r, i) => ({
            id: `top-${r.id}`,
            kind: i === 0 ? ('alert' as const) : ('stat' as const),
            tone: i === 0 ? ('danger' as const) : ('warning' as const),
            title: `${n(i + 1)}. ${nameOf(r.id)}`,
            desc: t('assistant.a.spotConcentration.itemDesc', { count: n(r.count), percent: n(r.percent) }),
          }))
        : [{
            id: 'none', kind: 'insight', tone: 'success',
            title: t('assistant.a.spotConcentration.noneTitle'), desc: t('assistant.a.spotConcentration.noneDesc'),
          }];
      return {
        intro: t('assistant.a.spotConcentration.intro', { unresolved: n(answer.unresolved), affected: n(answer.affected) }),
        cards,
        table: tableOf(
          [t('municipality'), t('assistant.col.unresolvedSpots'), t('assistant.col.share')],
          answer.byMunicipality.map((r) => [nameOf(r.id), r.count, r.percent]),
        ),
      };
    }
  }
}
