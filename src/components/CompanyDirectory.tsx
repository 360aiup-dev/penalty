import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertTriangle, 
  Check, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Layers,
  Calendar,
  DollarSign
} from 'lucide-react';
import { CompanySummary, FilterState } from '../types';
import { ALL_COMPANIES, ALL_CATEGORIES, ALL_TAGS } from '../data/dataProcessor';

interface CompanyDirectoryProps {
  onSelectCompany: (company: CompanySummary) => void;
  initialCategory?: string;
}

export const CompanyDirectory: React.FC<CompanyDirectoryProps> = ({
  onSelectCompany,
  initialCategory,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory || 'ALL');
  const [tag, setTag] = useState('ALL');
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [sortBy, setSortBy] = useState<'fine-desc' | 'fine-asc' | 'count-desc' | 'name-asc' | 'latest'>('fine-desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter logic
  const filteredCompanies = useMemo(() => {
    return ALL_COMPANIES.filter(c => {
      // 1. Search text
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const queryStripped = query.replace(/(餐飲|公司|企業|國際|實業|股份有限公司|有限公司|集團)/g, '');
        const matchesName = c.company.toLowerCase().includes(query) ||
          (queryStripped.length >= 2 && c.company.toLowerCase().includes(queryStripped));
        const matchesOwner = c.owner.toLowerCase().includes(query);
        const matchesClauses = c.clauses.some(cl => cl.toLowerCase().includes(query));
        const matchesTags = c.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesOwner && !matchesClauses && !matchesTags) {
          return false;
        }
      }

      // 2. Category
      if (category !== 'ALL' && c.category !== category) {
        return false;
      }

      // 3. Tag
      if (tag !== 'ALL' && !c.tags.includes(tag)) {
        return false;
      }

      // 4. Risk Level
      if (riskLevel !== 'ALL' && c.riskLevel !== riskLevel) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'fine-desc') return b.totalFine - a.totalFine;
      if (sortBy === 'fine-asc') return a.totalFine - b.totalFine;
      if (sortBy === 'count-desc') {
        if (b.violationCount !== a.violationCount) return b.violationCount - a.violationCount;
        return b.totalFine - a.totalFine;
      }
      if (sortBy === 'name-asc') return a.company.localeCompare(b.company, 'zh-Hant');
      if (sortBy === 'latest') {
        const aLatest = a.records[0];
        const bLatest = b.records[0];
        const aVal = aLatest ? aLatest.year * 100 + aLatest.month : 0;
        const bVal = bLatest ? bLatest.year * 100 + bLatest.month : 0;
        return bVal - aVal;
      }
      return 0;
    });
  }, [search, category, tag, riskLevel, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Main Filters Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
        {/* Search input and Quick Stats */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="搜尋公司名稱、負責人、法規條款 (如: 第24條、加班費、客運)..."
              className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                清除
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-500 whitespace-nowrap">
            <span>
              已篩選 <strong className="text-slate-900 font-bold">{filteredCompanies.length}</strong> / {ALL_COMPANIES.length} 家企業
            </span>
            <div className="h-4 w-px bg-slate-200" />
            {/* View Mode */}
            <div className="bg-slate-50 p-0.5 rounded-lg border border-slate-200/60 flex items-center">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                表格檢視
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                卡片檢視
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Industry Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">產業類別</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            >
              <option value="ALL">全部產業 ({ALL_COMPANIES.length})</option>
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({ALL_COMPANIES.filter(c => c.category === cat).length})
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">違規主題</label>
            <select
              value={tag}
              onChange={(e) => {
                setTag(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            >
              <option value="ALL">全部違規標籤</option>
              {ALL_TAGS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">風險評級</label>
            <select
              value={riskLevel}
              onChange={(e) => {
                setRiskLevel(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            >
              <option value="ALL">全部風險等級</option>
              <option value="HIGH">高風險警戒 ({ALL_COMPANIES.filter(c => c.riskLevel === 'HIGH').length})</option>
              <option value="MEDIUM">中度注意 ({ALL_COMPANIES.filter(c => c.riskLevel === 'MEDIUM').length})</option>
              <option value="LOW">低風險常態 ({ALL_COMPANIES.filter(c => c.riskLevel === 'LOW').length})</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">排序方式</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            >
              <option value="fine-desc">罰鍰金額：高到低</option>
              <option value="fine-asc">罰鍰金額：低到高</option>
              <option value="count-desc">裁罰次數：多到少</option>
              <option value="latest">最新裁罰日期</option>
              <option value="name-asc">企業名稱筆劃</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main List / Table */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-100 shadow-sm text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">無符合條件的企業</h3>
          <p className="text-xs text-slate-400 mt-1">
            請嘗試調整或放寬搜尋條件，或點選重置篩選。
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('ALL');
              setTag('ALL');
              setRiskLevel('ALL');
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            重置所有篩選
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-3 px-4 w-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">#</th>
                  <th className="py-3 px-4 min-w-[200px] text-[10px] font-bold text-slate-400 uppercase tracking-wider">受處分企業名稱</th>
                  <th className="py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">產業類別</th>
                  <th className="py-3 px-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">處分總額</th>
                  <th className="py-3 px-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">次數</th>
                  <th className="py-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">違規重點標籤</th>
                  <th className="py-3 px-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">風險等級</th>
                  <th className="py-3 px-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">最新處分</th>
                  <th className="py-3 px-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCompanies.map((c, index) => {
                  const globalIndex = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={c.company}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                        {globalIndex}
                      </td>

                      {/* Company name & Owner */}
                      <td className="py-3.5 px-4">
                        <div 
                          onClick={() => onSelectCompany(c)}
                          className="font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <span>{c.company}</span>
                          {c.violationCount > 1 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              累犯 {c.violationCount} 次
                            </span>
                          )}
                        </div>
                        {c.owner && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            負責人：{c.owner}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-100">
                          {c.category}
                        </span>
                      </td>

                      {/* Total Fine */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <span className={`font-mono font-bold ${
                          c.totalFine >= 100000 
                            ? 'text-rose-600 font-extrabold text-sm' 
                            : c.totalFine >= 50000 
                            ? 'text-amber-600' 
                            : 'text-slate-800'
                        }`}>
                          NT$ {c.totalFine.toLocaleString()}
                        </span>
                      </td>

                      {/* Violation Count */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          c.violationCount >= 3
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : c.violationCount > 1
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-50 text-slate-600'
                        }`}>
                          {c.violationCount} 件
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                          {c.tags.slice(0, 3).map((t, tidx) => (
                            <span
                              key={tidx}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                t === '規避勞檢'
                                  ? 'bg-rose-600 text-white'
                                  : t === '加班費' || t === '工時與出勤紀錄'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-50 text-slate-600 border border-slate-100'
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                          {c.tags.length > 3 && (
                            <span className="text-[10px] text-slate-400 px-1">
                              +{c.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Risk Level */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {c.riskLevel === 'HIGH' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            高風險
                          </span>
                        ) : c.riskLevel === 'MEDIUM' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            中度注意
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            常態低危
                          </span>
                        )}
                      </td>

                      {/* Latest Date */}
                      <td className="py-3.5 px-3 text-center text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {c.latestDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onSelectCompany(c)}
                          className="px-3 py-1 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 text-slate-700 rounded text-[11px] font-medium border border-slate-200/60 transition-colors"
                          title="查看詳細裁罰條文與案件"
                        >
                          詳情
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedCompanies.map((c) => {
            return (
              <div
                key={c.company}
                className="bg-white p-5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100">
                      {c.category}
                    </span>
                    {c.riskLevel === 'HIGH' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        高風險
                      </span>
                    ) : c.riskLevel === 'MEDIUM' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        中度注意
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        常態低危
                      </span>
                    )}
                  </div>

                  <h4 
                    onClick={() => onSelectCompany(c)}
                    className="text-sm font-bold text-slate-900 mt-2.5 hover:text-indigo-600 cursor-pointer transition-colors line-clamp-1"
                  >
                    {c.company}
                  </h4>

                  {c.owner && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      負責人：{c.owner}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">處分總金額</div>
                      <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                        NT$ {c.totalFine.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">處分次數 / 最新</div>
                      <div className="text-xs font-semibold text-slate-700 mt-0.5">
                        {c.violationCount} 次 · {c.latestDate}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {c.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer button */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onSelectCompany(c)}
                    className="w-full py-1.5 text-center text-xs font-medium bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 text-slate-800 rounded-lg transition-colors border border-slate-200/60"
                  >
                    查看案件詳情
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span>每頁顯示</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="py-1 px-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value={20}>20 家</option>
            <option value={25}>25 家</option>
            <option value={50}>50 家</option>
            <option value={100}>100 家</option>
            <option value={ALL_COMPANIES.length}>全部呈現 ({ALL_COMPANIES.length} 家)</option>
          </select>
          <span className="text-slate-400">
            目前顯示第 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredCompanies.length)} 筆 (共 {filteredCompanies.length} 筆)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-slate-700 font-medium">
            第 {currentPage} / {totalPages} 頁
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
