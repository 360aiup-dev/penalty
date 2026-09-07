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
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ChevronLeft,
  ChevronRight,
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
  const [isIndustryCollapsed, setIsIndustryCollapsed] = useState<boolean>(false);
  const [isTagsCollapsed, setIsTagsCollapsed] = useState<boolean>(false);

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

      {/* Charts Row: Industry breakdown & Violation Types (Collapsible Left / Right) */}
      <div className="flex flex-col lg:flex-row items-stretch gap-4 transition-all">
        {/* Industry Fines & Volume (Collapsible to the Left) */}
        {isIndustryCollapsed ? (
          <div
            onClick={() => setIsIndustryCollapsed(false)}
            role="button"
            tabIndex={0}
            title="點擊展開：各產業處分總金額與件數分佈"
            className="w-full lg:w-14 flex-shrink-0 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl p-3 flex flex-row lg:flex-col items-center justify-between cursor-pointer hover:bg-indigo-50/40 transition-all shadow-xs group min-h-[56px] lg:min-h-[390px]"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsIndustryCollapsed(false);
              }}
              className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors cursor-pointer"
              title="往右展開各產業處分圖表"
              aria-label="往右展開各產業處分圖表"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>

            <div className="flex flex-row lg:flex-col items-center gap-2 py-1 lg:py-4">
              <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-700 [writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] tracking-widest select-none">
                各產業處分分佈
              </span>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                11 產業
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-indigo-600 transition-colors">
              <span className="hidden lg:inline">展開</span>
              <ChevronRight className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0 bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col transition-all">
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  11 大產業
                </span>
                <button
                  onClick={() => setIsIndustryCollapsed(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer"
                  title="往左收起此圖表"
                  aria-label="往左收起此圖表"
                >
                  <PanelLeftClose className="w-3.5 h-3.5 text-indigo-600" />
                  <span>往左收起</span>
                </button>
              </div>
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
        )}

        {/* Center prompt when both are collapsed */}
        {isIndustryCollapsed && isTagsCollapsed && (
          <div className="flex-1 bg-slate-50/80 border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[390px]">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Filter className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">兩側分析圖表均已收合</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              點選兩側收合按鈕或下方快捷鍵，即可隨時重新展開圖表深入分析
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setIsIndustryCollapsed(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1.5 border border-indigo-200 transition-colors cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" /> 往右展開產業處分分佈
              </button>
              <button
                onClick={() => setIsTagsCollapsed(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" /> 往左展開違規原因標籤
              </button>
            </div>
          </div>
        )}

        {/* Violation Tags / Root Cause (Collapsible to the Right) */}
        {isTagsCollapsed ? (
          <div
            onClick={() => setIsTagsCollapsed(false)}
            role="button"
            tabIndex={0}
            title="點擊展開：主要違規原因標籤分佈"
            className="w-full lg:w-14 flex-shrink-0 bg-white border border-slate-200 hover:border-rose-400 rounded-xl p-3 flex flex-row lg:flex-col items-center justify-between cursor-pointer hover:bg-rose-50/40 transition-all shadow-xs group min-h-[56px] lg:min-h-[390px]"
          >
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-rose-600 transition-colors order-last lg:order-first">
              <ChevronLeft className="w-4 h-4 text-rose-600" />
              <span className="hidden lg:inline">展開</span>
            </div>

            <div className="flex flex-row lg:flex-col items-center gap-2 py-1 lg:py-4">
              <Layers className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-700 [writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl] tracking-widest select-none">
                違規原因標籤
              </span>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                {tagData.length} 類
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTagsCollapsed(false);
              }}
              className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors cursor-pointer order-first lg:order-last"
              title="往左展開違規標籤圖表"
              aria-label="往左展開違規標籤圖表"
            >
              <PanelRightOpen className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 min-w-0 bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col transition-all">
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                  {tagData.length} 類原因
                </span>
                <button
                  onClick={() => setIsTagsCollapsed(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                  title="往右收起此圖表"
                  aria-label="往右收起主要違規原因標籤分佈"
                >
                  <span>往右收起</span>
                  <PanelRightClose className="w-3.5 h-3.5 text-rose-600" />
                </button>
              </div>
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
        )}
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
