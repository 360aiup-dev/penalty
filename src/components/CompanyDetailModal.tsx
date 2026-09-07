import React from 'react';
import { 
  X, 
  Building2, 
  DollarSign, 
  Calendar, 
  ShieldAlert, 
  ShieldCheck, 
  Shield, 
  AlertCircle, 
  FileText, 
  User 
} from 'lucide-react';
import { CompanySummary } from '../types';

interface CompanyDetailModalProps {
  company: CompanySummary | null;
  onClose: () => void;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  company,
  onClose,
}) => {
  if (!company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-white">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                {company.category}
              </span>

              {company.riskLevel === 'HIGH' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  高風險警戒 ({company.riskScore} 分)
                </span>
              ) : company.riskLevel === 'MEDIUM' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  中度注意 ({company.riskScore} 分)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  低風險常態 ({company.riskScore} 分)
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-2">
              {company.company}
            </h3>

            {company.owner && (
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                登記負責人：{company.owner}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI strip */}
        <div className="grid grid-cols-3 gap-3 p-5 bg-white border-b border-slate-100 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-slate-400">處分總金額</span>
            <div className="text-base font-bold font-mono text-rose-600 mt-0.5">
              NT$ {company.totalFine.toLocaleString()}
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-slate-400">累計受罰次數</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {company.violationCount} 次案件
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-slate-400">最新裁處日期</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {company.latestDate}
            </div>
          </div>
        </div>

        {/* Violation Records List (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              歷次勞動基準法裁罰案由清冊 ({company.records.length} 件)
            </h4>
          </div>

          {company.records.map((record, index) => (
            <div
              key={record.id || index}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200/70 font-mono">
                    處分 #{index + 1}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    📅 {record.year} 年 {record.month} 月
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                  罰鍰 NT$ {record.fine.toLocaleString()}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {record.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Clauses violated */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-700">違反法令條款：</div>
                {record.clauses.map((clause, cIdx) => (
                  <div key={cIdx} className="text-xs font-mono bg-white p-2 rounded-lg border border-slate-200/60 text-slate-800">
                    ⚖️ {clause}
                  </div>
                ))}
              </div>

              {/* Detailed findings */}
              {record.details && record.details.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="text-[11px] font-bold text-slate-700">具體違規內容事證：</div>
                  {record.details.map((detail, dIdx) => (
                    <p key={dIdx} className="text-xs text-slate-600 bg-amber-50/40 border border-amber-100 p-2.5 rounded-lg">
                      • {detail}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
