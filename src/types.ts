export interface ViolationRecord {
  id: string;
  company: string;
  category: string;
  owner: string;
  clauses: string[];
  tags: string[];
  details: string[];
  year: number;
  month: number;
  fine: number;
}

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CompanySummary {
  company: string;
  category: string;
  owner: string;
  violationCount: number;
  totalFine: number;
  averageFine: number;
  tags: string[];
  clauses: string[];
  records: ViolationRecord[];
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  latestDate: string;
  hasInspectionEvasion: boolean;
  hasOccupationalInjury: boolean;
}

export interface IndustryStat {
  category: string;
  companyCount: number;
  violationCount: number;
  totalFine: number;
  avgFinePerCase: number;
  topTag: string;
  topClause: string;
}

export interface FilterState {
  search: string;
  category: string;
  tag: string;
  year: string;
  riskLevel: string;
  sortBy: 'fine-desc' | 'fine-asc' | 'count-desc' | 'name-asc' | 'latest';
}
