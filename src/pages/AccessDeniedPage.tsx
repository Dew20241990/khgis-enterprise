import { motion } from 'framer-motion';
import { ShieldX, ArrowLeft, Lock, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store/appStore';

export function AccessDeniedPage() {
  const { t, locale, user } = useApp();
  const navigate = useNavigate();

  const label = (ar: string, fr: string, en: string) => (locale === 'ar' ? ar : locale === 'fr' ? fr : en);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink-50 via-brand-50/30 to-ink-100 dark:from-ink-950 dark:via-ink-900 dark:to-ink-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full"
      >
        {/* Government emblem */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center shadow-gov">
            <Building2 className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-xl3 p-8 text-center shadow-lifted">
          {/* Lock icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex w-16 h-16 rounded-full bg-danger-50 dark:bg-danger-600/15 items-center justify-center mb-5"
          >
            <ShieldX className="w-8 h-8 text-danger-600 dark:text-danger-400" />
          </motion.div>

          {/* 403 badge */}
          <div className="inline-block px-3 py-1 rounded-full bg-danger-50 dark:bg-danger-600/15 text-danger-600 dark:text-danger-400 text-xs font-bold tracking-widest mb-3">
            403
          </div>

          <h1 className="text-xl font-bold text-ink-900 dark:text-white mb-2">
            {label('الوصول مقيد', 'Accès Restreint', 'Access Restricted')}
          </h1>

          <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed mb-6">
            {label(
              'ليس لديك صلاحية للوصول إلى هذه الوحدة. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مدير النظام.',
              'Vous n\'avez pas la permission d\'accéder à ce module. Si vous pensez qu\'il s\'agit d\'une erreur, veuillez contacter l\'administrateur système.',
              'You do not have permission to access this module. If you believe this is an error, please contact the system administrator.',
            )}
          </p>

          {/* User info */}
          {user && (
            <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-xl2 bg-ink-50 dark:bg-ink-800/40">
              <Lock className="w-3.5 h-3.5 text-ink-400" />
              <span className="text-xs text-ink-500 dark:text-ink-400">
                {label('الحساب الحالي', 'Compte actuel', 'Current account')}: <span className="font-semibold text-ink-700 dark:text-ink-200">{locale === 'ar' ? user.nameAr : locale === 'fr' ? user.nameFr : user.name}</span>
              </span>
            </div>
          )}

          {/* Return button */}
          <button
            onClick={() => navigate('/')}
            className="btn-primary w-full justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {label('العودة إلى لوحة القيادة', 'Retour au Tableau de Bord', 'Return to Dashboard')}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-ink-400 mt-4">
          {label('ولاية خنشلة — المنصة الحكومية الذكية', 'Wilaya de Khenchela — Plateforme Gouvernementale', 'Wilaya of Khenchela — Government Platform')}
        </p>
      </motion.div>
    </div>
  );
}
