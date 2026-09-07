import rawViolations from './violations.json';
import { ViolationRecord, CompanySummary, IndustryStat } from '../types';

export const ALL_VIOLATIONS: ViolationRecord[] = rawViolations as ViolationRecord[];

// Calculate company summaries
export function buildCompanySummaries(records: ViolationRecord[]): CompanySummary[] {
  const map = new Map<string, {
    category: string;
    owner: string;
    records: ViolationRecord[];
    tags: Set<string>;
    clauses: Set<string>;
    totalFine: number;
    hasEvasion: boolean;
    hasInjury: boolean;
  }>();

  records.forEach((r) => {
    const existing = map.get(r.company);
    const hasEvasion = r.tags.includes('規避勞檢') || r.clauses.some(c => c.includes('80條'));
    const hasInjury = r.tags.includes('職災補償') || r.clauses.some(c => c.includes('59條'));

    if (existing) {
      existing.records.push(r);
      existing.totalFine += r.fine;
      r.tags.forEach(t => existing.tags.add(t));
      r.clauses.forEach(c => existing.clauses.add(c));
      if (hasEvasion) existing.hasEvasion = true;
      if (hasInjury) existing.hasInjury = true;
      if (!existing.owner && r.owner) existing.owner = r.owner;
    } else {
      map.set(r.company, {
        category: r.category,
        owner: r.owner,
        records: [r],
        tags: new Set(r.tags),
        clauses: new Set(r.clauses),
        totalFine: r.fine,
        hasEvasion,
        hasInjury,
      });
    }
  });

  const summaries: CompanySummary[] = [];

  map.forEach((data, company) => {
    const count = data.records.length;
    const totalFine = data.totalFine;
    const avgFine = Math.round(totalFine / count);

    // Compute risk score (0 to 100)
    let score = 20;
    if (count > 1) score += (count - 1) * 25; // Repeat offenses
    if (totalFine >= 150000) score += 35;
    else if (totalFine >= 80000) score += 20;
    else if (totalFine >= 40000) score += 10;
    
    if (data.hasEvasion) score += 30; // Evaded labor inspection
    if (data.hasInjury) score += 20; // Occupational injury compensation disputes
    if (data.records.some(r => r.clauses.some(c => c.includes('32條')))) score += 10; // Overtime limits violation

    score = Math.min(100, score);

    let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (score >= 65 || totalFine >= 120000 || (count >= 2 && totalFine >= 60000)) {
      riskLevel = 'HIGH';
    } else if (score >= 35 || count > 1 || totalFine >= 40000) {
      riskLevel = 'MEDIUM';
    }

    // Sort records latest first
    const sortedRecords = [...data.records].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });

    const latest = sortedRecords[0];
    const latestDate = `${latest.year}年${latest.month}月`;

    summaries.push({
      company,
      category: data.category,
      owner: data.owner,
      violationCount: count,
      totalFine,
      averageFine: avgFine,
      tags: Array.from(data.tags),
      clauses: Array.from(data.clauses),
      records: sortedRecords,
      riskLevel,
      riskScore: score,
      latestDate,
      hasInspectionEvasion: data.hasEvasion,
      hasOccupationalInjury: data.hasInjury,
    });
  });

  return summaries;
}

export const ALL_COMPANIES = buildCompanySummaries(ALL_VIOLATIONS);

// Category stats
export function getIndustryStats(companies: CompanySummary[], violations: ViolationRecord[]): IndustryStat[] {
  const catMap = new Map<string, {
    companies: Set<string>;
    violationCount: number;
    totalFine: number;
    tags: Map<string, number>;
    clauses: Map<string, number>;
  }>();

  violations.forEach(v => {
    if (!catMap.has(v.category)) {
      catMap.set(v.category, {
        companies: new Set(),
        violationCount: 0,
        totalFine: 0,
        tags: new Map(),
        clauses: new Map(),
      });
    }
    const item = catMap.get(v.category)!;
    item.companies.add(v.company);
    item.violationCount += 1;
    item.totalFine += v.fine;

    v.tags.forEach(t => {
      item.tags.set(t, (item.tags.get(t) || 0) + 1);
    });
    v.clauses.forEach(c => {
      const simplified = c.split('、')[0].split('及')[0].trim();
      item.clauses.set(simplified, (item.clauses.get(simplified) || 0) + 1);
    });
  });

  const stats: IndustryStat[] = [];
  catMap.forEach((val, cat) => {
    let topTag = '無';
    let maxTagCount = 0;
    val.tags.forEach((cnt, tag) => {
      if (cnt > maxTagCount) {
        maxTagCount = cnt;
        topTag = tag;
      }
    });

    let topClause = '無';
    let maxClauseCount = 0;
    val.clauses.forEach((cnt, cl) => {
      if (cnt > maxClauseCount) {
        maxClauseCount = cnt;
        topClause = cl;
      }
    });

    stats.push({
      category: cat,
      companyCount: val.companies.size,
      violationCount: val.violationCount,
      totalFine: val.totalFine,
      avgFinePerCase: Math.round(val.totalFine / (val.violationCount || 1)),
      topTag,
      topClause,
    });
  });

  return stats.sort((a, b) => b.totalFine - a.totalFine);
}

// All available unique categories
export const ALL_CATEGORIES = Array.from(new Set(ALL_VIOLATIONS.map(v => v.category))).sort();

// All available tags
export const ALL_TAGS = [
  '加班費',
  '工時與出勤紀錄',
  '工資給付與明細',
  '例假與休息時間',
  '特別休假',
  '國定假日',
  '職災補償',
  '規避勞檢',
  '工作規則',
];
