/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { Header } from './components/Header';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { CompanyDirectory } from './components/CompanyDirectory';
import { DecisionMatrix } from './components/DecisionMatrix';
import { CompanyDetailModal } from './components/CompanyDetailModal';
import { ALL_COMPANIES, ALL_VIOLATIONS } from './data/dataProcessor';
import { CompanySummary } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'all-companies' | 'decision'>('overview');
  const [modalCompany, setModalCompany] = useState<CompanySummary | null>(null);
  const [directoryCategory, setDirectoryCategory] = useState<string>('ALL');

  // Switch to directory with specific category filter
  const handleCategorySelectFromCharts = (category: string) => {
    setDirectoryCategory(category);
    setActiveTab('all-companies');
  };

  // Open modal from charts or decision matrix
  const handleSelectCompanyByName = (companyName: string) => {
    const match = ALL_COMPANIES.find(c => c.company === companyName);
    if (match) setModalCompany(match);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col selection:bg-indigo-600 selection:text-white font-sans text-slate-800">
      {/* Top sticky navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <AnalyticsCharts
            onSelectCategory={handleCategorySelectFromCharts}
            onSelectCompany={handleSelectCompanyByName}
          />
        )}

        {activeTab === 'all-companies' && (
          <CompanyDirectory
            onSelectCompany={(comp) => setModalCompany(comp)}
            initialCategory={directoryCategory}
          />
        )}

        {activeTab === 'decision' && (
          <DecisionMatrix
            onSelectCompany={(comp) => setModalCompany(comp)}
          />
        )}
      </main>

      {/* Company detail modal */}
      <CompanyDetailModal
        company={modalCompany}
        onClose={() => setModalCompany(null)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100 bg-white py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center">
              <Scale className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-700">
              企業勞動合規矩陣
            </span>
            <span className="text-slate-400">· 完整收錄 {ALL_COMPANIES.length.toLocaleString()} 家企業共 {ALL_VIOLATIONS.length.toLocaleString()} 筆裁處案件（總額 8,490 萬）</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>主管機關勞檢處分公開實錄</span>
            <span>合規指標即時演算</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
