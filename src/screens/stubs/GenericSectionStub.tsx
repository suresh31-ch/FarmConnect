/**
 * FarmConnect Generic Section Stub
 * Renders structured preview screens for all drawer/tab modules (to be expanded in Part 2+)
 */

import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAppState } from '../../context/AppStateContext';

interface GenericSectionStubProps {
  title: string;
  subtitle: string;
  icon: string;
  category: string;
  description: string;
  sampleItems?: Array<{ title: string; subtitle: string; tag: string }>;
}

export const GenericSectionStub: React.FC<GenericSectionStubProps> = ({
  title,
  subtitle,
  icon,
  category,
  description,
  sampleItems,
}) => {
  const { t } = useLanguage();
  const { setActiveTab } = useAppState();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card variant="solid" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-md">
                <Icon name={icon} size={24} />
              </div>
              <Badge variant="emerald" size="md">{category}</Badge>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-300">
              {subtitle}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon="arrow_back"
            onClick={() => setActiveTab('home')}
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>

      {/* Info Notice */}
      <Card variant="outline" className="p-5 border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <Icon name="construction" size={24} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Part 1 Architecture Shell Ready • {t('comingSoon')}
            </h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
              {description} Complete backend workflows, AI endpoints, and real-time database feeds for this section will be integrated in subsequent parts.
            </p>
          </div>
        </div>
      </Card>

      {/* Preview Sample List if available */}
      {sampleItems && sampleItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-400">
            Ecosystem Preview Data
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sampleItems.map((item, idx) => (
              <Card key={idx} variant="glass" className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="emerald" size="sm">{item.tag}</Badge>
                  <Icon name="chevron_right" size={18} className="text-slate-400" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-emerald-100">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-emerald-300">{item.subtitle}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
