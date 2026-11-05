import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, BarChart3, Bot, Download, Image as ImageIcon, Lightbulb, MapPin, MessageSquare,
  Paperclip, Send, Sparkles, Trash2, TrendingUp, User,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Notice } from '@/components/ui/Notice';
import { useApp } from '@/store/appStore';
import { blackSpots, containers, municipalities } from '@/data/mockData';
import { toCsv } from '@/lib/csv';
import { downloadFile } from '@/lib/importExport';
import { formatTime } from '@/lib/format';
import { localizedName } from '@/lib/localized';
import {
  ASSISTANT_INTENTS, URGENT_FILL_PERCENT, detectIntent, runAssistant,
  type AssistantAnswer, type AssistantData, type AssistantIntent,
} from '@/lib/assistantEngine';
import { viewAnswer } from '@/lib/assistantView';
import type { Locale, TranslationKey } from '@/i18n/translations';
import { cn } from '@/lib/cn';

/**
 * Local analysis assistant. There is NO AI model behind this page: a question is mapped to one of four fixed
 * analyses that are computed from the demo datasets in the browser (see lib/assistantEngine.ts). The chat keeps
 * structured answers, not translated strings, so switching language relabels the whole conversation.
 */
type ChatItem =
  | { id: string; role: 'user'; at: number; text: string }
  | { id: string; role: 'ai'; at: number; kind: 'greeting' | 'unsupported' }
  | { id: string; role: 'ai'; at: number; kind: 'answer'; answer: AssistantAnswer };

const DATA: AssistantData = { spots: blackSpots, containers, municipalities };
const MUNICIPALITY_BY_ID = new Map(municipalities.map((m) => [m.id, m]));
const municipalityName = (locale: Locale, id: string) => localizedName(locale, MUNICIPALITY_BY_ID.get(id)) || id;

const QUESTION_KEYS: Record<AssistantIntent, TranslationKey> = {
  criticalSpots: 'assistant.q.criticalSpots',
  urgentContainers: 'assistant.q.urgentContainers',
  municipalityPerformance: 'assistant.q.municipalityPerformance',
  spotConcentration: 'assistant.q.spotConcentration',
};
const CAPABILITY_KEYS: Record<AssistantIntent, TranslationKey> = {
  criticalSpots: 'assistant.cap.criticalSpots',
  urgentContainers: 'assistant.cap.urgentContainers',
  municipalityPerformance: 'assistant.cap.municipalityPerformance',
  spotConcentration: 'assistant.cap.spotConcentration',
};
const INTENT_ICONS: Record<AssistantIntent, ReactNode> = {
  criticalSpots: <AlertTriangle className="w-4 h-4" />,
  urgentContainers: <Trash2 className="w-4 h-4" />,
  municipalityPerformance: <TrendingUp className="w-4 h-4" />,
  spotConcentration: <MapPin className="w-4 h-4" />,
};

const TONE_CLASSES = {
  danger: 'border-danger-200 dark:border-danger-600/30 bg-danger-50/40 dark:bg-danger-600/5',
  warning: 'border-warning-200 dark:border-warning-600/30 bg-warning-50/40 dark:bg-warning-600/5',
  success: 'border-success-200 dark:border-success-600/30 bg-success-50/40 dark:bg-success-600/5',
} as const;
const KIND_ICONS = {
  alert: <AlertTriangle className="w-4 h-4 text-danger-500" />,
  stat: <BarChart3 className="w-4 h-4 text-warning-500" />,
  insight: <Lightbulb className="w-4 h-4 text-success-500" />,
} as const;

/** Record codes such as CTN-2131 must stay on one line: a narrow screen would otherwise break them at the hyphen. */
function KeepCodesTogether({ text }: { text: string }) {
  // split() with a capturing group puts every matched code at an odd index
  return <>{text.split(/(\b[A-Z]{2,4}-\d+\b)/).map((part, i) => (i % 2 === 1 ? <span key={i} className="whitespace-nowrap">{part}</span> : part))}</>;
}

function AnswerBody({ answer }: { answer: AssistantAnswer }) {
  const { t, locale } = useApp();
  const view = viewAnswer(answer, t, locale, (id) => municipalityName(locale, id));
  const exportCsv = () => {
    if (!view.table) return;
    downloadFile(toCsv(view.table.headers, view.table.rows), `assistant-${answer.intent}.csv`, 'text/csv;charset=utf-8');
  };
  return (
    <>
      <p className="text-sm leading-relaxed">{view.intro}</p>
      {view.cards.length > 0 && (
        <div className="mt-3 space-y-2">
          {view.cards.map((c) => (
            <div key={c.id} className={cn('rounded-xl p-3 border', TONE_CLASSES[c.tone])}>
              <div className="flex items-center gap-2 mb-1">
                {KIND_ICONS[c.kind]}
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{c.title}</p>
              </div>
              <p className="text-xs text-ink-600 dark:text-ink-300"><KeepCodesTogether text={c.desc} /></p>
            </div>
          ))}
        </div>
      )}
      {view.table && (
        <button type="button" onClick={exportCsv} className="btn-outline text-xs w-full mt-3">
          <Download className="w-3.5 h-3.5" /> {t('assistant.exportCsv')}
        </button>
      )}
    </>
  );
}

export function AiAssistantPage() {
  const { t, locale } = useApp();
  const [items, setItems] = useState<ChatItem[]>(() => [{ id: 'm0', role: 'ai', kind: 'greeting', at: Date.now() }]);
  const [input, setInput] = useState('');
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (items.length > 1) endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, [items]);

  const ask = (text: string, intent: AssistantIntent | null) => {
    const question = text.trim();
    if (!question) return;
    const at = Date.now();
    const asked: ChatItem = { id: `m${nextId.current++}`, role: 'user', at, text: question };
    const reply: ChatItem = intent
      ? { id: `m${nextId.current++}`, role: 'ai', at, kind: 'answer', answer: runAssistant(intent, DATA) }
      : { id: `m${nextId.current++}`, role: 'ai', at, kind: 'unsupported' };
    setItems((prev) => [...prev, asked, reply]);
    setInput('');
  };
  const submit = () => ask(input, detectIntent(input));
  const runIntent = (intent: AssistantIntent) => ask(t(QUESTION_KEYS[intent]), intent);

  return (
    <div>
      <PageHeader
        title={t('aiAssistant')} subtitle={t('assistant.subtitle')}
        icon={<Sparkles className="w-5 h-5" />}
        actions={<Badge tone="warning" dot>{t('assistant.badge')}</Badge>}
      />

      <Notice tone="warning" title={t('assistant.notice.title')} className="mb-5">{t('assistant.notice.body')}</Notice>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col h-[calc(100vh-18rem)] min-h-[26rem]">
          <div role="log" aria-live="polite" aria-label={t('assistant.chatLog')} className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', m.role === 'ai' ? 'bg-gradient-to-br from-brand-500 to-success-500 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300')}>
                  {m.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={cn('max-w-[80%] rounded-xl2 px-4 py-3', m.role === 'ai' ? 'bg-ink-50 dark:bg-ink-800/60 text-ink-800 dark:text-ink-100' : 'bg-brand-600 text-white')}>
                  {m.role === 'user' && <p className="text-sm leading-relaxed">{m.text}</p>}
                  {m.role === 'ai' && m.kind === 'greeting' && <p className="text-sm leading-relaxed">{t('assistant.greeting')}</p>}
                  {m.role === 'ai' && m.kind === 'unsupported' && <p className="text-sm leading-relaxed">{t('assistant.unsupported')}</p>}
                  {m.role === 'ai' && m.kind === 'answer' && <AnswerBody answer={m.answer} />}
                  <p className={cn('text-[10px] mt-1.5', m.role === 'ai' ? 'text-ink-400' : 'text-white/70')}>{formatTime(locale, m.at)}</p>
                </div>
              </motion.div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-ink-200/70 dark:border-ink-800/70">
            {ASSISTANT_INTENTS.map((intent) => (
              <button key={intent} type="button" onClick={() => runIntent(intent)} className="chip bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-brand-50 dark:hover:bg-brand-600/10 hover:text-brand-700 dark:hover:text-brand-300 transition">
                {INTENT_ICONS[intent]} {t(QUESTION_KEYS[intent])}
              </button>
            ))}
          </div>

          {/* Input */}
          <form className="p-4 border-t border-ink-200/70 dark:border-ink-800/70 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('assistant.placeholder')}
              aria-label={t('assistant.placeholder')}
              className="input flex-1"
            />
            <button type="submit" disabled={!input.trim()} aria-label={t('assistant.send')} className="btn-primary p-2.5 disabled:opacity-50">
              <Send className="w-5 h-5 rtl:-scale-x-100" />
            </button>
          </form>
        </Card>

        {/* Right panel: what is real, and what is not */}
        <div className="space-y-5">
          <Card>
            <CardHeader title={t('assistant.capabilities.title')} icon={<Sparkles className="w-4 h-4" />} />
            <CardBody className="space-y-1.5">
              {/* Card subtitles are truncated to one line; this hint must stay fully readable, so it wraps here. */}
              <p className="px-2.5 pb-1 text-xs leading-relaxed text-ink-500 dark:text-ink-400">{t('assistant.capabilities.hint')}</p>
              {ASSISTANT_INTENTS.map((intent) => (
                <button key={intent} type="button" onClick={() => runIntent(intent)} className="w-full flex items-start gap-3 p-2.5 rounded-xl text-start hover:bg-ink-50 dark:hover:bg-ink-800/40 transition">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">{INTENT_ICONS[intent]}</div>
                  <div>
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{t(QUESTION_KEYS[intent])}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">{t(CAPABILITY_KEYS[intent], { threshold: URGENT_FILL_PERCENT })}</p>
                  </div>
                </button>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('assistant.unavailable.title')} />
            <CardBody className="space-y-3">
              {([
                [<MessageSquare key="chat" className="w-4 h-4" />, 'assistant.unavailable.chat'],
                [<ImageIcon key="images" className="w-4 h-4" />, 'assistant.unavailable.images'],
                [<Paperclip key="files" className="w-4 h-4" />, 'assistant.unavailable.attachments'],
              ] as const).map(([icon, key]) => (
                <div key={key} className="flex items-start gap-3 text-xs text-ink-500 dark:text-ink-400">
                  <span className="mt-0.5 shrink-0">{icon}</span>
                  <p className="leading-relaxed">{t(key)}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
