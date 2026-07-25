import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Paperclip, Camera, FileText, TrendingUp, AlertTriangle,
  Trash2, MapPin, Lightbulb, BarChart3, Image as ImageIcon, Bot, User, Download,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/store/appStore';
import { cn } from '@/lib/cn';

interface Msg { id: string; role: 'user' | 'ai'; text: string; time: string; cards?: { type: string; title: string; desc: string; tone: string }[] }

const suggestions = [
  { icon: <AlertTriangle className="w-4 h-4" />, text: 'حلل النقاط السوداء الحرجة هذا الشهر' },
  { icon: <Trash2 className="w-4 h-4" />, text: 'أي حاويات تحتاج تفريغ عاجل؟' },
  { icon: <TrendingUp className="w-4 h-4" />, text: 'ولّد تقرير أداء الأحياء' },
  { icon: <MapPin className="w-4 h-4" />, text: 'أين تتركز النقاط السوداء جغرافياً؟' },
];

export function AiAssistantPage() {
  const { t } = useApp();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'm1', role: 'ai', time: '10:30',
      text: 'مرحباً سفيان! أنا المساعد الذكي لإدارة النظافة. يمكنني تحليل بيانات النقاط السوداء، الحاويات، المركبات، وتوليد التقارير تلقائياً. كيف يمكنني مساعدتك اليوم؟',
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: `u${Date.now()}`, role: 'user', text, time: '10:42' };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const aiMsg: Msg = {
        id: `a${Date.now()}`, role: 'ai', time: '10:42',
        text: 'بناءً على تحليل البيانات الحالية، إليك أهم النتائج:',
        cards: [
          { type: 'alert', title: '3 نقاط حرجة في حراش', desc: 'تراكم نفايات يتطلب تدخلاً خلال 24 ساعة.', tone: 'danger' },
          { type: 'stat', title: 'متوسط الامتلاء 72%', desc: '12 حاوية تجاوزت 90% وتحتاج تفريغ فوري.', tone: 'warning' },
          { type: 'insight', title: 'تحسن زمن الاستجابة', desc: 'انخفض من 48 إلى 28 ساعة (-42%) خلال 6 أسابيع.', tone: 'success' },
        ],
      };
      setMessages((m) => [...m, aiMsg]);
      setTyping(false);
    }, 1400);
  };

  const toneMap: Record<string, string> = {
    danger: 'border-danger-200 dark:border-danger-600/30 bg-danger-50/40 dark:bg-danger-600/5',
    warning: 'border-warning-200 dark:border-warning-600/30 bg-warning-50/40 dark:bg-warning-600/5',
    success: 'border-success-200 dark:border-success-600/30 bg-success-50/40 dark:bg-success-600/5',
  };
  const iconMap: Record<string, React.ReactNode> = {
    alert: <AlertTriangle className="w-4 h-4 text-danger-500" />,
    stat: <BarChart3 className="w-4 h-4 text-warning-500" />,
    insight: <Lightbulb className="w-4 h-4 text-success-500" />,
  };

  return (
    <div>
      <PageHeader
        title={t('aiAssistant')} subtitle="مساعد ذكي لتحليل البيانات وتوليد التقارير"
        icon={<Sparkles className="w-5 h-5" />}
        actions={<Badge tone="brand" dot>متصل · GPT-4o</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col h-[calc(100vh-16rem)]">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', m.role === 'ai' ? 'bg-gradient-to-br from-brand-500 to-success-500 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300')}>
                  {m.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={cn('max-w-[80%] rounded-xl2 px-4 py-3', m.role === 'ai' ? 'bg-ink-50 dark:bg-ink-800/60 text-ink-800 dark:text-ink-100' : 'bg-brand-600 text-white')}>
                  <p className="text-sm leading-relaxed">{m.text}</p>
                  {m.cards && (
                    <div className="mt-3 space-y-2">
                      {m.cards.map((c, i) => (
                        <div key={i} className={cn('rounded-xl p-3 border', toneMap[c.tone])}>
                          <div className="flex items-center gap-2 mb-1">
                            {iconMap[c.type]}
                            <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{c.title}</p>
                          </div>
                          <p className="text-xs text-ink-600 dark:text-ink-300">{c.desc}</p>
                        </div>
                      ))}
                      <button className="btn-outline text-xs w-full mt-2"><Download className="w-3.5 h-3.5" /> توليد تقرير كامل</button>
                    </div>
                  )}
                  <p className={cn('text-[10px] mt-1.5', m.role === 'ai' ? 'text-ink-400' : 'text-white/60')}>{m.time}</p>
                </div>
              </motion.div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-success-500 text-white flex items-center justify-center"><Bot className="w-5 h-5" /></div>
                <div className="bg-ink-50 dark:bg-ink-800/60 rounded-xl2 px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-ink-200/70 dark:border-ink-800/70">
            {suggestions.map((s) => (
              <button key={s.text} onClick={() => send(s.text)} className="chip bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-brand-50 dark:hover:bg-brand-600/10 hover:text-brand-700 dark:hover:text-brand-300 transition">
                {s.icon} {s.text}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-ink-200/70 dark:border-ink-800/70 flex items-center gap-2">
            <button className="p-2.5 rounded-xl text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition"><Paperclip className="w-5 h-5" /></button>
            <button className="p-2.5 rounded-xl text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition"><Camera className="w-5 h-5" /></button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="اكتب سؤالك أو اطلب تحليلاً..."
              className="input flex-1"
            />
            <button onClick={() => send(input)} className="btn-primary p-2.5"><Send className="w-5 h-5" /></button>
          </div>
        </Card>

        {/* Right panel: capabilities */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="قدرات المساعد" icon={<Sparkles className="w-4 h-4" />} />
            <CardBody className="space-y-3">
              {[
                { icon: <ImageIcon className="w-4 h-4" />, title: 'تحليل الصور', desc: 'كشف النفايات من صور التفتيش' },
                { icon: <Trash2 className="w-4 h-4" />, title: 'كشف النفايات', desc: 'تصنيف نوع وكمية النفايات' },
                { icon: <FileText className="w-4 h-4" />, title: 'توليد التقارير', desc: 'تقارير تلقائية شاملة' },
                { icon: <Lightbulb className="w-4 h-4" />, title: 'توصيات ذكية', desc: 'إجراءات مقترحة للتحسين' },
                { icon: <MapPin className="w-4 h-4" />, title: 'تحليل جغرافي', desc: 'تركز النقاط السوداء' },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/40 transition">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-600/15 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">{c.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{c.title}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">{c.desc}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="تحليل صورة" subtitle="كشف النفايات بالذكاء الاصطناعي" icon={<Camera className="w-4 h-4" />} />
            <CardBody>
              <div className="aspect-video rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800 mb-3 relative">
                <img src="https://images.pexels.com/photos/4601395/pexels-photo-4601395.jpeg?auto=compress&cs=tinysrgb&w=600" alt="تحليل" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute top-4 left-4 chip bg-danger-500 text-white animate-pulse-soft">نفايات: 87%</div>
                  <div className="absolute bottom-4 right-4 chip bg-success-500 text-white">منطقة نظيفة: 13%</div>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-ink-500">نوع النفايات</span><span className="font-medium text-ink-800 dark:text-ink-100">منزلية عضوية</span></div>
                <div className="flex justify-between"><span className="text-ink-500">الكمية المقدرة</span><span className="font-medium text-ink-800 dark:text-ink-100">~2.4 م³</span></div>
                <div className="flex justify-between"><span className="text-ink-500">الأولوية</span><Badge tone="danger">حرجة</Badge></div>
                <div className="flex justify-between"><span className="text-ink-500">الإجراء المقترح</span><span className="font-medium text-brand-600 dark:text-brand-400">تفريغ + إضافة حاويتين</span></div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
