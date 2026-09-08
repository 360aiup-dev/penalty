import React from 'react';
import { 
  Building2, 
  AlertTriangle, 
  DollarSign, 
  Scale, 
  BarChart3, 
  ShieldAlert
} from 'lucide-react';
import { ALL_COMPANIES, ALL_VIOLATIONS } from '../data/dataProcessor';

interface HeaderProps {
  activeTab: 'overview' | 'all-companies' | 'decision';
  setActiveTab: (tab: 'overview' | 'all-companies' | 'decision') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const totalFines = ALL_VIOLATIONS.reduce((sum, v) => sum + v.fine, 0);
  const totalCompanies = ALL_COMPANIES.length;
  const repeatOffenders = ALL_COMPANIES.filter(c => c.violationCount > 1).length;
  const highRiskCount = ALL_COMPANIES.filter(c => c.riskLevel === 'HIGH').length;

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                企業勞動裁罰分析矩陣
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {ALL_VIOLATIONS.length.toLocaleString()} 筆處分實錄 · 全數收錄（{(totalFines / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })} 萬元）
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-normal">
              自動彙整多方裁罰數據 · 跨產業深度分析 · 快速合規與避坑決策
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 sm:gap-3 self-start md:self-auto overflow-x-auto pb-1 md:pb-0">
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">裁罰總額</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                NT$ {(totalFines / 10000).toFixed(1)} 萬
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">受處分企業</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                {totalCompanies.toLocaleString()} 家
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">累犯企業</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                {repeatOffenders} 家
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 sm:space-x-6 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-1 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            宏觀視覺化圖表
          </button>

          <button
            onClick={() => setActiveTab('all-companies')}
            className={`flex items-center gap-2 py-3 px-1 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'all-companies'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            全數企業總覽
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'all-companies' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {totalCompanies}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('decision')}
            className={`flex items-center gap-2 py-3 px-1 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'decision'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            快速決策與風險透視
            {highRiskCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                {highRiskCount} 高危
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
