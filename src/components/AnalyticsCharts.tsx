import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  CartesianGrid,
} from 'recharts';
import { 
  Building2, 
  TrendingUp, 
  Layers, 
  AlertOctagon, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { ALL_VIOLATIONS, ALL_CATEGORIES, getIndustryStats, ALL_COMPANIES } from '../data/dataProcessor';

const COLORS = ['#4f46e5', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#0ea5e9', '#14b8a6'];
const TAG_COLORS = {
  '工資給付與明細': '#4f46e5',
  '加班費': '#ef4444',
  '工時與出勤紀錄': '#f59e0b',
  '例假與休息時間': '#10b981',
  '特別休假': '#8b5cf6',
  '國定假日': '#ec4899',
  '規避勞檢': '#b91c1c',
  '職災補償': '#6366f1',
  '工作規則': '#64748b',
};

interface AnalyticsChartsProps {
  onSelectCategory?: (category: string) => void;
  onSelectCompany?: (companyName: string) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  onSelectCategory,
  onSelectCompany,
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');

  // Filter records based on selected industry
  const filteredViolations = useMemo(() => {
    if (selectedIndustry === 'ALL') return ALL_VIOLATIONS;
    return ALL_VIOLATIONS.filter(v => v.category === selectedIndustry);
  }, [selectedIndustry]);

  // 1. Industry stats data
  const industryStats = useMemo(() => {
    return getIndustryStats(ALL_COMPANIES, ALL_VIOLATIONS).map(s => ({
      ...s,
      fineWan: Math.round(s.totalFine / 10000),
    }));
  }, []);

  // 2. Violation tag distribution
  const tagData = useMemo(() => {
    const counts: Record<string, { count: number; totalFine: number }> = {};
    filteredViolations.forEach(v => {
      v.tags.forEach(tag => {
        if (!counts[tag]) counts[tag] = { count: 0, totalFine: 0 };
        counts[tag].count += 1;
        counts[tag].totalFine += v.fine;
      });
    });

    return Object.entries(counts)
      .map(([name, val]) => ({
        name,
        count: val.count,
        fineWan: Math.round(val.totalFine / 10000),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredViolations]);

  // Top fined companies
  const topFinedCompanies = useMemo(() => {
    const pool = selectedIndustry === 'ALL' 
      ? ALL_COMPANIES 
      : ALL_COMPANIES.filter(c => c.category === selectedIndustry);

    return [...pool].sort((a, b) => b.totalFine - a.totalFine).slice(0, 8);
  }, [selectedIndustry]);

  return (
    <div className="space-y-6">
      {/* Category selector filter strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-slate-900">聚焦特定產業數據分析</span>
            <span className="text-xs text-slate-400">
              (點選下方任一產業，圖表即時重算)
            </span>
          </div>
          {selectedIndustry !== 'ALL' && (
            <button
              onClick={() => setSelectedIndustry('ALL')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              重置為全體產業
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedIndustry('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedIndustry === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            全部產業 ({ALL_VIOLATIONS.length.toLocaleString()} 筆)
          </button>
          {ALL_CATEGORIES.map(cat => {
            const count = ALL_VIOLATIONS.filter(v => v.category === cat).length;
            const isSelected = selectedIndustry === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedIndustry(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200/80 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid 1: Industry breakdown & Violation Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Fines & Volume */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                各產業處分總金額與件數分佈
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                單位：裁罰總金額 (萬元 NTD) 與受處分案數
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              11 大產業
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={industryStats}
                margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="category" 
                  angle={-35} 
                  textAnchor="end" 
                  interval={0}
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  height={50}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(val: any, name: any) => [
                    name === 'fineWan' ? `${val} 萬元` : `${val} 件`,
                    name === 'fineWan' ? '處分總額' : '處分件數'
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar 
                  dataKey="fineWan" 
                  name="處分總額 (萬)" 
                  fill="#4f46e5" 
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(entry) => onSelectCategory && onSelectCategory(entry.category)}
                />
                <Bar 
                  dataKey="violationCount" 
                  name="處分案數 (件)" 
                  fill="#94a3b8" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 text-right">
            *可點選直條圖切換檢視該產業所有受處分公司
          </p>
        </div>

        {/* Violation Tags / Root Cause */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-600" />
                主要違規原因標籤分佈
                {selectedIndustry !== 'ALL' && ` · ${selectedIndustry}`}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                分析企業最常觸犯的勞動基準法核心主題
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
              {tagData.length} 類原因
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tagData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={90} 
                  tick={{ fontSize: 11, fill: '#334155' }}
                />
                <Tooltip 
                  formatter={(val: any) => [`${val} 次違規事件`, '次數']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar 
                  dataKey="count" 
                  name="違規次數" 
                  fill="#ef4444" 
                  radius={[0, 4, 4, 0]} 
                >
                  {tagData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={(TAG_COLORS as any)[entry.name] || '#4f46e5'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
            <span>最常犯條款：第22條 (工資全額給付)、第24條 (加班費未發)</span>
            <span className="font-semibold text-rose-600">合規重點警示</span>
          </div>
        </div>
      </div>

      {/* Top Companies Leaderboard Quick Glance */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-500" />
              裁罰總額最高前 8 大企業
              {selectedIndustry !== 'ALL' && ` (${selectedIndustry})`}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              點選任一企業名稱可立即進入深度透視
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {topFinedCompanies.map((c, index) => (
            <div
              key={c.company}
              onClick={() => onSelectCompany && onSelectCompany(c.company)}
              className="p-4 rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer bg-white group"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  index < 3 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  TOP {index + 1}
                </span>
                <span className="text-xs font-bold text-rose-600">
                  NT$ {c.totalFine.toLocaleString()}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-2 truncate group-hover:text-indigo-600 transition-colors">
                {c.company}
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>{c.category}</span>
                <span>累計 {c.violationCount} 次處分</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2.5">
                {c.tags.slice(0, 2).map((t, tidx) => (
                  <span key={tidx} className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
