import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Shield, 
  AlertTriangle, 
  Search, 
  Briefcase, 
  Building2, 
  Zap, 
  CheckCircle2, 
  XCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { CompanySummary } from '../types';
import { ALL_COMPANIES } from '../data/dataProcessor';

interface DecisionMatrixProps {
  onSelectCompany: (company: CompanySummary) => void;
}

// Known common aliases or commercial names mapped to full registered entity names
const COMPANY_ALIASES: Record<string, string> = {
  '新天地餐飲': '新天地國際實業股份有限公司',
  '新天地': '新天地國際實業股份有限公司',
  '新天地餐飲集團': '新天地國際實業股份有限公司',
  '新天地國際': '新天地國際實業股份有限公司',
  '新天地國際實業': '新天地國際實業股份有限公司',
  '統聯': '統聯汽車客運股份有限公司',
  '統聯客運': '統聯汽車客運股份有限公司',
  '統聯汽車客運': '統聯汽車客運股份有限公司',
  '大立光': '大立光電股份有限公司',
  '大立光電': '大立光電股份有限公司',
  '居之友': '居之友保全股份有限公司',
  '居之友保全': '居之友保全股份有限公司',
};

export const DecisionMatrix: React.FC<DecisionMatrixProps> = ({
  onSelectCompany,
}) => {
  const [targetCompanyInput, setTargetCompanyInput] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<CompanySummary | null>(null);
  const [evaluatedQuery, setEvaluatedQuery] = useState<string>('');

  // 1. Job Seeker Red Flags (High overtime, unpaid overtime, no holidays)
  const jobSeekerRisks = useMemo(() => {
    return ALL_COMPANIES.filter(c => {
      const hasOvertime = c.tags.includes('加班費') || c.tags.includes('工時與出勤紀錄');
      const hasNoRest = c.tags.includes('例假與休息時間') || c.tags.includes('特別休假');
      return (hasOvertime && hasNoRest) || c.totalFine >= 60000;
    }).slice(0, 10);
  }, []);

  // 2. Severe Red Lines: Inspection Evasion & Work Injury Compensation
  const severeRedLines = useMemo(() => {
    return ALL_COMPANIES.filter(c => c.hasInspectionEvasion || c.hasOccupationalInjury);
  }, []);

  // 3. Repeat Offenders
  const repeatOffenders = useMemo(() => {
    return ALL_COMPANIES.filter(c => c.violationCount > 1)
      .sort((a, b) => {
        if (b.violationCount !== a.violationCount) return b.violationCount - a.violationCount;
        return b.totalFine - a.totalFine;
      })
      .slice(0, 10);
  }, []);

  // Evaluate single company
  const handleEvaluate = (companyName: string) => {
    const raw = companyName.trim();
    if (!raw) {
      setSelectedEvaluation(null);
      setEvaluatedQuery('');
      return;
    }
    setEvaluatedQuery(raw);

    // 1. Check known alias
    if (COMPANY_ALIASES[raw]) {
      const targetEntity = COMPANY_ALIASES[raw];
      const aliasMatch = ALL_COMPANIES.find(c => c.company === targetEntity);
      if (aliasMatch) {
        setSelectedEvaluation(aliasMatch);
        return;
      }
    }

    const clean = raw.toLowerCase();

    // 2. Direct inclusion match
    let match = ALL_COMPANIES.find(c => c.company.toLowerCase().includes(clean));

    // 3. Reverse inclusion match
    if (!match) {
      match = ALL_COMPANIES.find(c => clean.includes(c.company.toLowerCase()));
    }

    // 4. Substring without common industry/corp noise words
    if (!match) {
      const stripped = clean.replace(/(餐飲|公司|企業|國際|實業|股份有限公司|有限公司|科技|保全|客運|集團|飯店|百貨)/g, '');
      if (stripped.length >= 2) {
        match = ALL_COMPANIES.find(c => c.company.toLowerCase().includes(stripped));
      }
    }

    // 5. Token match
    if (!match) {
      const tokens = clean.split(/\s+/).filter(t => t.length > 1);
      if (tokens.length > 0) {
        match = ALL_COMPANIES.find(c => tokens.every(t => c.company.toLowerCase().includes(t)));
      }
    }

    setSelectedEvaluation(match || null);
  };

  return (
    <div className="space-y-6">
      {/* Fast Risk Evaluation Tool Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            快速風控決策模擬器
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            企業勞動合規 3 秒體檢診斷
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            無論是求職應徵、B2B供應鏈採購、或合作招標前，輸入公司名稱立即檢測該企業的勞檢受罰紀錄與合規風險評級。
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={targetCompanyInput}
                onChange={(e) => setTargetCompanyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEvaluate(targetCompanyInput)}
                placeholder="輸入公司關鍵字 (例如: 新天地餐飲、統聯、大立光、居之友)..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={() => handleEvaluate(targetCompanyInput)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs whitespace-nowrap"
            >
              立即診斷
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 flex-wrap">
            <span>熱門快搜：</span>
            {[
              { label: '新天地餐飲', query: '新天地餐飲' },
              { label: '統聯汽車客運', query: '統聯汽車客運' },
              { label: '大立光電', query: '大立光電' },
              { label: '居之友保全', query: '居之友保全' }
            ].map(item => (
              <button
                key={item.label}
                onClick={() => {
                  setTargetCompanyInput(item.query);
                  handleEvaluate(item.query);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Diagnosis Result Box */}
        {selectedEvaluation && (
          <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div>
                <span className="text-xs px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200/60 font-medium">
                  {selectedEvaluation.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedEvaluation.company}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {selectedEvaluation.riskLevel === 'HIGH' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    高風險警戒 ({selectedEvaluation.riskScore} 分)
                  </span>
                ) : selectedEvaluation.riskLevel === 'MEDIUM' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    中度注意 ({selectedEvaluation.riskScore} 分)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    低風險常態 ({selectedEvaluation.riskScore} 分)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                <span className="text-slate-400">處分累計金額</span>
                <div className="text-base font-bold font-mono text-rose-600 mt-0.5">
                  NT$ {selectedEvaluation.totalFine.toLocaleString()}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                <span className="text-slate-400">違規案數 / 最新時間</span>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {selectedEvaluation.violationCount} 件 · {selectedEvaluation.latestDate}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                <span className="text-slate-400">主要違規主題</span>
                <div className="text-xs font-medium text-slate-700 mt-0.5 truncate">
                  {selectedEvaluation.tags.join('、')}
                </div>
              </div>
            </div>

            {/* Practical Advice */}
            <div className="text-xs space-y-1.5 text-slate-600 bg-white p-3.5 rounded-lg border border-slate-200/60">
              <div className="font-semibold text-indigo-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                決策與避坑建議：
              </div>
              {selectedEvaluation.tags.includes('加班費') && (
                <p>• 求職者注意：該公司曾有「未依規定發給延長工時工資(加班費)」處分紀錄，面談時應特別確認加班補貼計算方式與出勤打卡機制。</p>
              )}
              {selectedEvaluation.tags.includes('工時與出勤紀錄') && (
                <p>• 工時警示：曾有「延長工時超過法令上限」或「未備置出勤紀錄」，可能存在高工時或打卡不實風險。</p>
              )}
              {selectedEvaluation.hasInspectionEvasion && (
                <p className="text-rose-600 font-semibold">• 重大警訊：曾有「規避、妨礙或拒絕勞動檢查」之情節，法規意識薄弱，合作或入職需高度謹慎！</p>
              )}
              {selectedEvaluation.violationCount === 1 && selectedEvaluation.totalFine === 20000 && (
                <p className="text-emerald-700">• 輕微初犯：僅有單一裁罰基準案件，目前維持常態低危評估。</p>
              )}
            </div>

            <div className="mt-3 text-right">
              <button
                onClick={() => onSelectCompany(selectedEvaluation)}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
              >
                查看這家公司的完整處分案由與歷次細節 →
              </button>
            </div>
          </div>
        )}

        {/* Not Found Feedback */}
        {evaluatedQuery && !selectedEvaluation && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-3 animate-in fade-in duration-200">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              於 2,186 筆勞檢處分實錄中未檢索到「<strong className="text-slate-900">{evaluatedQuery}</strong>」之違規裁處紀錄（代表無近兩年公開處分案，或請嘗試簡化關鍵字如「新天地」、「大立光」）。
            </div>
          </div>
        )}
      </div>

      {/* Decision Lists 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Job Seeker Alert List */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-600" />
                求職者防雷警示清單
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-100">
                加班·休假高危
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              篩選出同時涉及加班費欠給、超時工時及休假爭議之主要受處分企業：
            </p>

            <div className="space-y-2">
              {jobSeekerRisks.map((c) => (
                <div
                  key={c.company}
                  onClick={() => onSelectCompany(c)}
                  className="p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="truncate max-w-[180px]">{c.company}</span>
                    <span className="font-mono text-rose-600">NT$ {c.totalFine.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{c.category}</span>
                    <span className="text-amber-700 font-medium">處分 {c.violationCount} 次</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {c.tags.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.2 bg-amber-50/80 text-amber-800 rounded border border-amber-100">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Red Flag Violations (Evasion & Work Injury) */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                重大紅線企業名單
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-bold border border-rose-100">
                規避勞檢·職災
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              涉及勞基法第80條(拒絕勞檢)或第59條(職災補償爭議)之企業：
            </p>

            <div className="space-y-2">
              {severeRedLines.map((c) => (
                <div
                  key={c.company}
                  onClick={() => onSelectCompany(c)}
                  className="p-3 rounded-lg border border-rose-100 bg-rose-50/20 hover:border-rose-300 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="truncate max-w-[180px]">{c.company}</span>
                    <span className="font-mono text-rose-700">NT$ {c.totalFine.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{c.category}</span>
                    <span className="text-rose-700 font-bold">
                      {c.hasInspectionEvasion ? '⚠️ 規避勞檢' : '⚠️ 職災補償'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">
                    條款：{c.clauses.join('、')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Multiple Repeat Offenders */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-indigo-600" />
                多重累犯受處分排行榜
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-bold border border-indigo-100">
                多次處分
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              在統計期間內累積 2 次以上處分之企業：
            </p>

            <div className="space-y-2">
              {repeatOffenders.map((c, idx) => (
                <div
                  key={c.company}
                  onClick={() => onSelectCompany(c)}
                  className="p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 rounded">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {c.company}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {c.category} · 最新：{c.latestDate}
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <div className="text-xs font-bold text-indigo-700">
                      處分 {c.violationCount} 次
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      NT$ {(c.totalFine / 10000).toFixed(1)} 萬
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
