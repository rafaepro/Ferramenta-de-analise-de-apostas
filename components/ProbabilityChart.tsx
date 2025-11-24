import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Probabilities } from '../types';

interface ProbabilityChartProps {
  data: Probabilities;
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({ data }) => {
  
  const chartData = [
    { name: 'Vitória A', value: data.winA, color: '#10b981' },
    { name: 'Empate', value: data.draw, color: '#94a3b8' },
    { name: 'Vitória B', value: data.winB, color: '#3b82f6' },
  ];

  const marketData = [
    { name: 'Over 1.5', value: data.over15 },
    { name: 'Over 2.5', value: data.over25 },
    { name: 'BTTS', value: data.btts },
    { name: 'Gol 1T', value: data.goalFirstHalf },
    { name: 'Gol >75\'', value: data.goalAfter75 },
  ];

  return (
    <div className="space-y-6">
      <div className="h-48 w-full">
        <h4 className="text-sm text-slate-400 mb-2 text-center uppercase tracking-wide">Probabilidade do Resultado (1x2)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={60} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
              cursor={{fill: 'transparent'}}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
         <h4 className="text-sm text-slate-400 mb-2 text-center uppercase tracking-wide">Mercados de Gols</h4>
         {marketData.map((item) => (
           <div key={item.name} className="relative pt-1">
             <div className="flex mb-1 items-center justify-between">
               <span className="text-xs font-semibold inline-block text-slate-300">
                 {item.name}
               </span>
               <span className="text-xs font-semibold inline-block text-emerald-400">
                 {item.value}%
               </span>
             </div>
             <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-slate-700">
               <div
                 style={{ width: `${item.value}%` }}
                 className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    item.value > 65 ? 'bg-emerald-500' : item.value > 40 ? 'bg-blue-500' : 'bg-slate-500'
                 }`}
               ></div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};
