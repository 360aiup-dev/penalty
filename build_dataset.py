import csv
import json
import re
import os

# Industry category keywords mapping
CATEGORY_KEYWORDS = [
    ('餐飲服務業', ['餐飲', '餐廳', '咖啡', '小吃', '麵食', '料理', '茶坊', '茶行', '鍋物', '燒肉', '早午餐', '早餐', '便當', '烘焙', '食堂', '美食', '豆漿', '甜點', '牛肉麵', '滷味', '冰品', '肉圓', '刈包', '烤肉']),
    ('照護與長照機構', ['長照', '照服', '居家長照', '老人養護', '護理之家', '長期照顧', '產後護理', '社區長照', '日間照顧', '養護中心', '安養']),
    ('醫療與保健業', ['診所', '醫院', '耳鼻喉', '中醫', '婦產科', '眼科', '牙醫', '骨科', '外科', '醫學', '藥局', '健保', '醫療', '醫美', '整形', '保健']),
    ('保全與支援服務業', ['保全', '公寓大廈', '物業', '清潔', '管理維護', '人力資源', '人才', '人力仲介', '顧問', '行銷', '企管', '徵信', '環境分析', '消毒']),
    ('營建與工程業', ['工程', '營造', '建設', '水電', '室內裝修', '設計工程', '起重', '裝潢', '鐵件', '鷹架', '空調', '土木', '景觀']),
    ('交通與運輸業', ['交通', '通運', '客運', '貨運', '汽車', '租賃', '物流', '航運', '船務', '報關', '倉儲', '旅運', '運通', '遊覽車', '加油站']),
    ('教育與文教業', ['幼兒園', '補習班', '學校', '教育', '文理', '文教', '托嬰', '托育', '課後', '短期補習', '中等學校', '科技大學', '實驗教育']),
    ('製造與科技業', ['製造', '科技', '精密', '工業', '機械', '鋼鐵', '生技', '塑膠', '電子', '光電', '化學', '生醫', '電器', '五金', '金屬', '材料', '線纜', '工具', '光學', '電梯']),
    ('批發與零售業', ['批發', '零售', '實業', '貿易', '洋酒', '服飾', '彩券', '商行', '商社', '名門', '百貨', '食品', '企業社', '蔬果', '超市', '行號', '生活館', '車業']),
    ('公益與社會機構', ['基金會', '協會', '公會', '工會', '學會', '社會福利', '農會', '教會', '捐血', '傳播']),
    ('一般商業服務', ['有限公司', '股份有限公司', '企業', '國際'])
]

def infer_category(company_name, csv_category):
    if csv_category:
        csv_cat = csv_category.strip()
        if csv_cat in ['餐飲']: return '餐飲服務業'
        if csv_cat in ['照服']: return '照護與長照機構'
        if csv_cat in ['診所']: return '醫療與保健業'
        if csv_cat in ['行政']: return '保全與支援服務業'
        if csv_cat in ['工程']: return '營建與工程業'
        if csv_cat in ['製造']: return '製造與科技業'
        if csv_cat in ['教育']: return '教育與文教業'
        if csv_cat in ['公益']: return '公益與社會機構'

    for cat_name, kw_list in CATEGORY_KEYWORDS:
        for kw in kw_list:
            if kw in company_name:
                return cat_name
    return '一般商業服務'

def parse_and_save():
    csv_path = 'src/data/raw_violations.csv'
    json_path = 'src/data/violations.json'
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        records = []
        
        for row in reader:
            if len(row) < 10:
                continue
            idx = row[0].strip()
            if not idx or not idx.isdigit():
                continue
                
            company = row[1].strip()
            cat_raw = row[2].strip()
            owner = row[3].strip()
            clauses_raw = row[4].strip()
            tags_raw = row[5].strip()
            details_raw = row[6].strip()
            year_str = row[7].strip()
            month_str = row[8].strip()
            fine_str = row[9].strip()
            
            category = infer_category(company, cat_raw)
            
            # Clean clauses
            clauses = [
                c.strip().replace('‧', '').strip()
                for c in re.split(r'[\n\r]+', clauses_raw)
                if c.strip().replace('‧', '').strip()
            ]
            if not clauses and clauses_raw:
                clauses = [clauses_raw.replace('‧', '').strip()]
                
            # Clean tags
            tags = [
                t.strip()
                for t in re.split(r'[、,]+', tags_raw)
                if t.strip()
            ]
            
            # Clean details
            details = [
                d.strip().replace('‧', '').strip()
                for d in re.split(r'[\n\r]+', details_raw)
                if d.strip().replace('‧', '').strip()
            ]
            if not details and details_raw:
                details = [details_raw.replace('‧', '').strip()]
                
            year = int(year_str) if year_str.isdigit() else 2024
            month = int(month_str) if month_str.isdigit() else 1
            fine = int(fine_str) if fine_str.isdigit() else 0
            
            records.append({
                'id': idx,
                'company': company,
                'category': category,
                'owner': owner,
                'clauses': clauses,
                'tags': tags,
                'details': details,
                'year': year,
                'month': month,
                'fine': fine
            })
            
    print(f"Parsed {len(records)} records from CSV.")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"Successfully saved to {json_path}")

if __name__ == '__main__':
    parse_and_save()
