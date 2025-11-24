import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  colorClass: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, icon: Icon, colorClass, children, fullWidth }) => {
  return (
    <div className={`bg-slate-850 border border-slate-700/50 rounded-xl p-6 shadow-lg backdrop-blur-sm hover:border-slate-600 transition-all duration-300 ${fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}`}>
      <div className="flex items-center gap-3 mb-4 border-b border-slate-700/50 pb-3">
        <div className={`p-2 rounded-lg bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <h3 className="text-xl font-bold text-slate-100">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export const DataRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 py-1">
    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</span>
    <span className="text-slate-200 font-medium text-right">{value}</span>
  </div>
);
