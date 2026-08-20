import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  ScreenerCondition,
  StockListItem,
  SavedGroup,
  ScreenerResultItem,
  RangeCond,
} from '@/types';
import { fetchStockListBackend, fetchFinancialBackend, fetchKline, fetchMainInflow } from '@/services/stockApi';
import {
  macd, kdj, isMacdGoldenCross, isKdjGoldenCross, isBullsAlignment, latestRsi,
  isBollBreakout, isWrOversold,
} from '@/utils/indicators';
import { MARKET_SCOPES } from '@/utils/constants';
import { Filter, Play, Save, Trash2, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'stock_screener_groups';

const emptyRange = (): RangeCond => ({ min: null, max: null });

const DEFAULT_CONDITION: ScreenerCondition = {
  scope: 'all',
  pe: emptyRange(),
  totalMarketCap: emptyRange(),
  pb: emptyRange(),
  floatMarketCap: emptyRange(),
  totalShares: emptyRange(),
  floatShares: emptyRange(),
  netProfit: emptyRange(),
  grossMargin: emptyRange(),
  eps: emptyRange(),
  holderCount: emptyRange(),
  netProfitGrowth: emptyRange(),
  netMargin: emptyRange(),
  bps: emptyRange(),
  dividendYield: emptyRange(),
  revenue: emptyRange(),
  cashFlowPerShare: emptyRange(),
  debtRatio: emptyRange(),
  roe: emptyRange(),
  revenueGrowth: emptyRange(),
  price: emptyRange(),
  change: emptyRange(),
  limitUpDown: emptyRange(),
  turnover: emptyRange(),
  volumeRatio: emptyRange(),
  bigOrder: emptyRange(),
  amplitude: emptyRange(),
  mainInflow: false,
  amount: emptyRange(),
  volume: emptyRange(),
  commissionRatio: emptyRange(),
  bullsAlignment: false,
  bollBreakout: false,
  macdGoldenCross: false,
  kdjGoldenCross: false,
  rsiOversold: false,
  wrOversold: false,
  klinePattern: false,
  shareholderChange: false,
  nationalTeam: false,
  unlock: false,
  dragonTiger: false,
  privatePlacement: false,
  institutionRating: false,
  chipDistribution: false,
  beatMarket: false,
  marketAttention: false,
  highTransfer: false,
  marketActivity: false,
  bullBearLine: false,
  masterPick: false,
};

type RangeFieldKey =
  | 'pe' | 'totalMarketCap' | 'pb' | 'floatMarketCap' | 'totalShares' | 'floatShares'
  | 'netProfit' | 'grossMargin' | 'eps' | 'holderCount' | 'netProfitGrowth' | 'netMargin'
  | 'bps' | 'dividendYield' | 'revenue' | 'cashFlowPerShare' | 'debtRatio' | 'roe' | 'revenueGrowth'
  | 'price' | 'change' | 'limitUpDown' | 'turnover' | 'volumeRatio' | 'bigOrder' | 'amplitude'
  | 'amount' | 'volume' | 'commissionRatio';

interface FieldDef {
  key: RangeFieldKey;
  label: string;
  desc: string;
  unit?: string;
  available: boolean; // false = 数据源暂未提供，界面禁用
}

const VALUATION_FIELDS: FieldDef[] = [
  { key: 'pe', label: '市盈率', desc: '市盈率 = 股价 ÷ 每股收益，衡量估值高低，越低通常越便宜。亏损股无市盈率。', available: true },
  { key: 'totalMarketCap', label: '总市值', desc: '公司全部股票按现价计算的总价值 = 股价 × 总股本。', unit: '亿', available: true },
  { key: 'pb', label: '市净率', desc: '市净率 = 股价 ÷ 每股净资产，衡量股价相对净资产的倍数。', available: true },
  { key: 'floatMarketCap', label: '流通市值', desc: '可自由流通交易的股票按现价计算的价值。', unit: '亿', available: true },
  { key: 'totalShares', label: '总股本', desc: '公司发行的全部股份总数。', unit: '亿股', available: false },
  { key: 'floatShares', label: '流通股本', desc: '可在市场上自由交易的股份数量。', unit: '亿股', available: false },
];

const FINANCIAL_FIELDS: FieldDef[] = [
  { key: 'netProfit', label: '净利润', desc: '公司一定时期赚取的利润总额，反映最终盈利能力。', unit: '亿', available: true },
  { key: 'grossMargin', label: '毛利率', desc: '毛利 ÷ 营业收入，反映产品的核心竞争力。', unit: '%', available: true },
  { key: 'eps', label: '每股收益', desc: '净利润 ÷ 总股本，反映每股创造的利润。', unit: '元', available: true },
  { key: 'holderCount', label: '股东户数', desc: '持有该股的股东数，户数减少通常意味着筹码集中。', unit: '户', available: false },
  { key: 'netProfitGrowth', label: '净利增长', desc: '净利润相比上年同期的增长率。', unit: '%', available: true },
  { key: 'netMargin', label: '净利率', desc: '净利润 ÷ 营业收入，反映整体盈利效率。', unit: '%', available: true },
  { key: 'bps', label: '每股净资产', desc: '净资产 ÷ 总股本，反映每股对应的账面资产。', unit: '元', available: true },
  { key: 'dividendYield', label: '股息率', desc: '每股分红 ÷ 股价，反映现金分红回报。', unit: '%', available: false },
  { key: 'revenue', label: '营业收入', desc: '公司主营业务收入总额。', unit: '亿', available: true },
  { key: 'cashFlowPerShare', label: '每股现金流', desc: '经营现金流 ÷ 总股本，反映现金质量。', unit: '元', available: true },
  { key: 'debtRatio', label: '资产负债率', desc: '总负债 ÷ 总资产，衡量杠杆和偿债风险。', unit: '%', available: true },
  { key: 'roe', label: 'ROE', desc: '净资产收益率 = 净利润 ÷ 净资产，衡量股东资金的使用效率。', unit: '%', available: true },
  { key: 'revenueGrowth', label: '营收增长', desc: '营业收入相比上年同期的增长率。', unit: '%', available: true },
];

const QUOTE_FIELDS: FieldDef[] = [
  { key: 'price', label: '股价', desc: '股票当前的成交价格。', available: true },
  { key: 'change', label: '涨跌幅', desc: '当前价相对昨日收盘价的涨跌百分比。', unit: '%', available: true },
  { key: 'limitUpDown', label: '涨跌停', desc: '股价是否触及涨停或跌停限制。', available: false },
  { key: 'turnover', label: '换手率', desc: '成交量 ÷ 流通股本，反映交易活跃程度。', unit: '%', available: true },
  { key: 'volumeRatio', label: '量比', desc: '当前成交量与过去5日平均成交量的比值，反映放量程度。', available: true },
  { key: 'bigOrder', label: '大单', desc: '大额资金的买卖成交情况。', available: false },
  { key: 'amplitude', label: '振幅', desc: '(最高价 - 最低价) ÷ 昨收，反映日内波动幅度。', unit: '%', available: true },
  { key: 'amount', label: '成交额', desc: '当日成交的总金额。', unit: '亿', available: true },
  { key: 'volume', label: '成交量', desc: '当日成交的股票数量。', unit: '万手', available: true },
  { key: 'commissionRatio', label: '委比', desc: '委托买入量与委托卖出量的相对比例。', unit: '%', available: false },
];

type TechIndicatorKey =
  | 'bullsAlignment' | 'bollBreakout' | 'macdGoldenCross' | 'kdjGoldenCross'
  | 'rsiOversold' | 'wrOversold' | 'klinePattern';

const TECH_INDICATORS: { key: TechIndicatorKey; label: string; desc: string; available: boolean }[] = [
  { key: 'bullsAlignment', label: '均线多头排列', desc: 'MA5 > MA10 > MA20，短期趋势向上。', available: true },
  { key: 'bollBreakout', label: 'BOLL 突破上轨', desc: '股价突破布林带上轨，可能进入强势。', available: true },
  { key: 'macdGoldenCross', label: 'MACD 金叉', desc: 'DIF 线上穿 DEA 线，看涨信号。', available: true },
  { key: 'kdjGoldenCross', label: 'KDJ 金叉', desc: 'K 线上穿 D 线，看涨信号。', available: true },
  { key: 'rsiOversold', label: 'RSI 超卖 (<30)', desc: 'RSI 低于 30，可能超跌反弹。', available: true },
  { key: 'wrOversold', label: 'WR 超卖 (>80)', desc: '威廉指标高于 80，超卖信号。', available: true },
  { key: 'klinePattern', label: '经典K线形态', desc: '如红三兵、锤子线等经典看涨形态。', available: false },
];

type FeatureIndicatorKey =
  | 'shareholderChange' | 'nationalTeam' | 'unlock' | 'dragonTiger' | 'privatePlacement'
  | 'institutionRating' | 'chipDistribution' | 'beatMarket' | 'marketAttention'
  | 'highTransfer' | 'marketActivity' | 'bullBearLine' | 'masterPick';

const HIGHLIGHT_INDICATORS: { key: FeatureIndicatorKey; label: string; desc: string }[] = [
  { key: 'shareholderChange', label: '增减持', desc: '重要股东增持（利好）或减持（利空）。' },
  { key: 'nationalTeam', label: '国家队持股', desc: '汇金、证金等国家队资金持仓。' },
];

const RISK_INDICATORS: { key: FeatureIndicatorKey; label: string; desc: string }[] = [
  { key: 'unlock', label: '解禁', desc: '限售股解禁，可能带来抛售压力。' },
  { key: 'dragonTiger', label: '龙虎榜', desc: '登上龙虎榜，反映游资或机构关注。' },
  { key: 'privatePlacement', label: '定向增发', desc: '向特定对象增发股份融资。' },
];

const OTHER_FEATURE_INDICATORS: { key: FeatureIndicatorKey; label: string; desc: string }[] = [
  { key: 'institutionRating', label: '机构评级', desc: '券商研报的买入、增持等评级。' },
  { key: 'chipDistribution', label: '筹码分布', desc: '筹码集中度，反映持仓结构。' },
  { key: 'beatMarket', label: '跑赢大盘', desc: '个股涨幅超过大盘指数涨幅。' },
  { key: 'marketAttention', label: '市场关注度', desc: '市场对该股的热度。' },
  { key: 'highTransfer', label: '高送转', desc: '高比例送股或资本公积转增。' },
  { key: 'marketActivity', label: '市场活跃度', desc: '交易的活跃程度。' },
  { key: 'bullBearLine', label: '牛熊线', desc: '股价相对牛熊分界线（年线）的位置。' },
  { key: 'masterPick', label: '模拟赛高手选股', desc: '模拟炒股大赛高手的选股。' },
];

/** 本地并发池 */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

function loadGroups(): SavedGroup[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** 指标名称悬停提示 */
function Hint({ label, desc }: { label: string; desc: string }) {
  return (
    <span className="relative inline-block group">
      <span className="cursor-help border-b border-dotted border-gray-400">{label}</span>
      <span className="pointer-events-none absolute left-0 bottom-full mb-1.5 z-50 hidden group-hover:block w-60 bg-gray-900 text-white text-xs leading-relaxed rounded-lg px-3 py-2 shadow-xl">
        {desc}
      </span>
    </span>
  );
}

function RangeField({
  label,
  desc,
  unit,
  range,
  onChange,
  disabled,
}: {
  label: string;
  desc: string;
  unit?: string;
  range: RangeCond;
  onChange: (r: RangeCond) => void;
  disabled?: boolean;
}) {
  const inputCls =
    'w-full min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';
  const parse = (s: string) => (s === '' ? null : Number(s));
  return (
    <div className={`flex items-center gap-2 ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-sm text-gray-600 w-16 flex-shrink-0"><Hint label={label} desc={desc} /></span>
      <input
        type="number"
        value={range.min ?? ''}
        onChange={(e) => onChange({ ...range, min: parse(e.target.value) })}
        placeholder={disabled ? '待接入' : '不限'}
        disabled={disabled}
        className={inputCls}
      />
      <span className="text-gray-300">~</span>
      <input
        type="number"
        value={range.max ?? ''}
        onChange={(e) => onChange({ ...range, max: parse(e.target.value) })}
        placeholder={disabled ? '待接入' : '不限'}
        disabled={disabled}
        className={inputCls}
      />
      {unit && <span className="text-xs text-gray-400 flex-shrink-0">{unit}</span>}
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`flex items-center justify-between w-full py-1.5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="text-sm text-gray-600">
        <Hint label={label} desc={desc} />
        {disabled && <span className="ml-1 text-xs text-gray-400">待接入</span>}
      </span>
      <span
        className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
          style={{ marginTop: '2px' }}
        />
      </span>
    </button>
  );
}

export default function StockScreener() {
  const navigate = useNavigate();
  const [condition, setCondition] = useState<ScreenerCondition>(DEFAULT_CONDITION);
  const [results, setResults] = useState<ScreenerResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [groups, setGroups] = useState<SavedGroup[]>(loadGroups);
  const [sortField, setSortField] = useState<keyof ScreenerResultItem>('changePercent');
  const [sortDesc, setSortDesc] = useState(true);

  const set = <K extends keyof ScreenerCondition>(key: K, value: ScreenerCondition[K]) => {
    setCondition((c) => ({ ...c, [key]: value }));
  };

  const needTechAnalysis =
    condition.macdGoldenCross ||
    condition.kdjGoldenCross ||
    condition.rsiOversold ||
    condition.bullsAlignment ||
    condition.bollBreakout ||
    condition.wrOversold;

  const inRange = (val: number, r: RangeCond): boolean => {
    if (r.min != null && val < r.min) return false;
    if (r.max != null && val > r.max) return false;
    return true;
  };

  const stage1Filter = (list: StockListItem[]): StockListItem[] => {
    const c = condition;
    const hasPe = c.pe.min != null || c.pe.max != null;
    const hasPb = c.pb.min != null || c.pb.max != null;
    return list.filter((s) => {
      // 估值
      if (hasPe && s.pe <= 0) return false; // 设置 PE 时排除亏损股
      if (!inRange(s.pe, c.pe)) return false;
      if (hasPb && s.pb <= 0) return false;
      if (!inRange(s.pb, c.pb)) return false;
      if (!inRange(s.totalMarketCap / 1e8, c.totalMarketCap)) return false;
      if (!inRange(s.floatMarketCap / 1e8, c.floatMarketCap)) return false;
      // 行情指标
      if (!inRange(s.price, c.price)) return false;
      if (!inRange(s.changePercent, c.change)) return false;
      if (!inRange(s.turnoverRate, c.turnover)) return false;
      if (!inRange(s.volumeRatio, c.volumeRatio)) return false;
      if (!inRange(s.amplitude, c.amplitude)) return false;
      if (!inRange(s.amount / 1e8, c.amount)) return false;
      if (!inRange(s.volume / 1e4, c.volume)) return false;
      return true;
    });
  };

  // 财务筛选（需先通过 fetchFinancialBackend 填充财务字段）
  const financialFilter = (list: StockListItem[]): StockListItem[] => {
    const c = condition;
    return list.filter((s) => {
      if (!inRange(s.netProfit / 1e8, c.netProfit)) return false;
      if (!inRange(s.grossMargin, c.grossMargin)) return false;
      if (!inRange(s.eps, c.eps)) return false;
      if (!inRange(s.netProfitGrowth, c.netProfitGrowth)) return false;
      if (!inRange(s.netMargin, c.netMargin)) return false;
      if (!inRange(s.bps, c.bps)) return false;
      if (!inRange(s.revenue / 1e8, c.revenue)) return false;
      if (!inRange(s.cashFlowPerShare, c.cashFlowPerShare)) return false;
      if (!inRange(s.debtRatio, c.debtRatio)) return false;
      if (!inRange(s.roe, c.roe)) return false;
      if (!inRange(s.revenueGrowth, c.revenueGrowth)) return false;
      return true;
    });
  };

  const needFinancial = FINANCIAL_FIELDS.some((f) => {
    const r = condition[f.key];
    return r.min != null || r.max != null;
  });

  const analyzeTech = async (item: StockListItem): Promise<ScreenerResultItem | null> => {
    const klines = await fetchKline(item.code, 'day', 60);
    if (klines.length < 20) return null;
    const closes = klines.map((k) => k.close);
    const { dif, dea } = macd(closes);
    const { k, d } = kdj(klines);
    const rsiVal = latestRsi(closes);
    const signals = {
      macd: isMacdGoldenCross(dif, dea),
      kdj: isKdjGoldenCross(k, d),
      rsi: rsiVal != null && rsiVal < 30,
      bulls: isBullsAlignment(closes),
      boll: isBollBreakout(closes),
      wr: isWrOversold(klines),
    };
    return { ...item, signals };
  };

  const runScreener = useCallback(async () => {
    setLoading(true);
    setError('');
    setNotice('');
    setResults([]);
    try {
      const list = await fetchStockListBackend();
      if (list.length === 0) {
        setError('未获取到股票列表，请确认后端服务已启动（cd server && uvicorn main:app --port 8000）');
        return;
      }
      let candidates = stage1Filter(list);

      // 财务筛选：候选集逐只查财务（同花顺单只接口）
      if (needFinancial) {
        const FIN_LIMIT = 200;
        const total = candidates.length;
        const limited = candidates.slice(0, FIN_LIMIT);
        const enriched = await mapLimit(limited, 5, async (s) => {
          const fin = await fetchFinancialBackend(s.code);
          return { ...s, ...fin };
        });
        candidates = financialFilter(enriched);
        if (total > FIN_LIMIT) {
          setNotice(`基础条件命中 ${total} 只，财务分析仅覆盖前 ${FIN_LIMIT} 只，建议缩小范围`);
        }
      }

      let result: ScreenerResultItem[];
      const LIMITED = 200;
      if (needTechAnalysis) {
        const limited = candidates.slice(0, LIMITED);
        const analyzed = await mapLimit(limited, 5, analyzeTech);
        result = analyzed.filter((r): r is ScreenerResultItem => {
          if (!r) return false;
          if (condition.macdGoldenCross && !r.signals.macd) return false;
          if (condition.kdjGoldenCross && !r.signals.kdj) return false;
          if (condition.rsiOversold && !r.signals.rsi) return false;
          if (condition.bullsAlignment && !r.signals.bulls) return false;
          if (condition.bollBreakout && !r.signals.boll) return false;
          if (condition.wrOversold && !r.signals.wr) return false;
          return true;
        });
        if (candidates.length > LIMITED) {
          setNotice(`基础条件命中 ${candidates.length} 只，技术分析仅覆盖前 ${LIMITED} 只，建议缩小范围`);
        }
      } else {
        result = candidates.map((s) => ({
          ...s,
          signals: { macd: false, kdj: false, rsi: false, bulls: false, boll: false, wr: false },
        }));
      }

      if (condition.mainInflow) {
        const filtered = await mapLimit(result, 5, async (item) => {
          const inflow = await fetchMainInflow(item.code);
          return inflow != null && inflow > 0 ? item : null;
        });
        result = filtered.filter((r): r is ScreenerResultItem => r != null);
      }

      setResults(result);
    } catch (err) {
      console.error('[screener] run error', err);
      setError('选股失败，请稍后重试');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition]);

  const saveGroup = () => {
    const name = prompt('请输入分组名称');
    if (!name?.trim()) return;
    const group: SavedGroup = {
      id: `g_${Date.now()}`,
      name: name.trim(),
      condition,
      createdAt: new Date().toLocaleString(),
    };
    const next = [...groups, group];
    setGroups(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const loadGroup = (id: string) => {
    const g = groups.find((x) => x.id === id);
    if (g) setCondition(g.condition);
  };

  const deleteGroup = (id: string) => {
    const next = groups.filter((x) => x.id !== id);
    setGroups(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const sortedResults = [...results].sort((a, b) => {
    const va = a[sortField];
    const vb = b[sortField];
    if (typeof va === 'string' && typeof vb === 'string') {
      return sortDesc ? vb.localeCompare(va) : va.localeCompare(vb);
    }
    return sortDesc ? (vb as number) - (va as number) : (va as number) - (vb as number);
  });

  const signalBadges = (s: ScreenerResultItem['signals']) => {
    const items: { key: string; label: string; on: boolean }[] = [
      { key: 'macd', label: 'MACD', on: s.macd },
      { key: 'kdj', label: 'KDJ', on: s.kdj },
      { key: 'rsi', label: 'RSI', on: s.rsi },
      { key: 'bulls', label: '多头', on: s.bulls },
      { key: 'boll', label: 'BOLL', on: s.boll },
      { key: 'wr', label: 'WR', on: s.wr },
    ];
    return items.map((it) => (
      <span
        key={it.key}
        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
          it.on ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
        }`}
      >
        {it.label}
      </span>
    ));
  };

  const columns: [keyof ScreenerResultItem, string][] = [
    ['code', '代码'],
    ['name', '名称'],
    ['price', '现价'],
    ['changePercent', '涨跌幅%'],
    ['pe', '市盈率'],
    ['pb', '市净率'],
    ['totalMarketCap', '总市值'],
    ['turnoverRate', '换手率%'],
    ['volumeRatio', '量比'],
    ['amplitude', '振幅%'],
  ];

  const renderFieldGroup = (fields: FieldDef[]) => (
    <div className="space-y-3">
      {fields.map((f) => (
        <RangeField
          key={f.key}
          label={f.label}
          desc={f.desc}
          unit={f.unit}
          range={condition[f.key]}
          onChange={(r) => set(f.key, r)}
          disabled={!f.available}
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">智能选股</h1>
          <p className="text-gray-500 mt-1">按估值、财务、技术面等条件筛选 A 股</p>
        </div>
        {groups.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) loadGroup(e.target.value);
            }}
            defaultValue=""
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              加载已保存分组
            </option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 条件面板 */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="card sticky top-20 space-y-6">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900">筛选条件</h2>
            </div>

            {/* 选股范围 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">选股范围</p>
              <div className="grid grid-cols-2 gap-2">
                {MARKET_SCOPES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => set('scope', s.value)}
                    className={`px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      condition.scope === s.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 估值指标 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">估值指标</p>
              {renderFieldGroup(VALUATION_FIELDS)}
            </div>

            {/* 财务指标 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">财务指标</p>
              {renderFieldGroup(FINANCIAL_FIELDS)}
            </div>

            {/* 技术面 — 行情指标 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">技术面 · 行情指标</p>
              {renderFieldGroup(QUOTE_FIELDS)}
              <div className="pt-3 mt-3 border-t border-gray-100">
                <Toggle label="主力资金净流入" desc="主力资金买入金额减去卖出金额，净流入为正说明主力看多。" checked={condition.mainInflow} onChange={(v) => set('mainInflow', v)} />
              </div>
            </div>

            {/* 技术面 — 技术指标 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">技术面 · 技术指标</p>
              <div className="space-y-1">
                {TECH_INDICATORS.map((t) => (
                  <Toggle
                    key={t.key}
                    label={t.label}
                    desc={t.desc}
                    checked={condition[t.key]}
                    onChange={(v) => set(t.key, v)}
                    disabled={!t.available}
                  />
                ))}
              </div>
            </div>

            {/* 特色指标 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">特色指标</p>
              <p className="text-xs text-gray-500 mb-2">亮点</p>
              <div className="space-y-1 mb-3">
                {HIGHLIGHT_INDICATORS.map((t) => (
                  <Toggle key={t.key} label={t.label} desc={t.desc} checked={condition[t.key]} onChange={(v) => set(t.key, v)} disabled />
                ))}
              </div>
              <p className="text-xs text-gray-500 mb-2">风险</p>
              <div className="space-y-1 mb-3">
                {RISK_INDICATORS.map((t) => (
                  <Toggle key={t.key} label={t.label} desc={t.desc} checked={condition[t.key]} onChange={(v) => set(t.key, v)} disabled />
                ))}
              </div>
              <p className="text-xs text-gray-500 mb-2">其他</p>
              <div className="space-y-1">
                {OTHER_FEATURE_INDICATORS.map((t) => (
                  <Toggle key={t.key} label={t.label} desc={t.desc} checked={condition[t.key]} onChange={(v) => set(t.key, v)} disabled />
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400 -mt-2">灰色项待接入数据源后可用</p>

            <button
              onClick={runScreener}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              {loading ? '筛选中…' : '开始选股'}
            </button>

            <button
              onClick={saveGroup}
              className="w-full flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 font-medium py-2 rounded-lg transition-colors text-sm"
            >
              <Save size={16} />
              保存为分组
            </button>
          </div>
        </div>

        {/* 结果区 */}
        <div className="flex-1 min-w-0">
          {notice && (
            <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              {notice}
            </div>
          )}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {groups.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {groups.map((g) => (
                <span key={g.id} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  <button onClick={() => loadGroup(g.id)} className="hover:text-blue-600">
                    {g.name}
                  </button>
                  <button onClick={() => deleteGroup(g.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {results.length > 0 && !loading && (
            <p className="text-sm text-gray-500 mb-3">
              共 <span className="font-semibold text-gray-900">{results.length}</span> 只符合条件的股票
            </p>
          )}

          {!loading && results.length === 0 && !error && (
            <div className="card text-center py-20">
              <Filter size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">设置左侧条件，点击「开始选股」</p>
            </div>
          )}

          {results.length > 0 && !loading && (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs">
                    <tr>
                      {columns.map(([k, label]) => (
                        <th
                          key={k}
                          onClick={() => {
                            if (sortField === k) setSortDesc(!sortDesc);
                            else {
                              setSortField(k);
                              setSortDesc(true);
                            }
                          }}
                          className="px-3 py-3 text-left cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                        >
                          {label}
                          {sortField === k && (sortDesc ? ' ↓' : ' ↑')}
                        </th>
                      ))}
                      <th className="px-3 py-3 text-left">信号</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((s) => (
                      <tr
                        key={s.code}
                        onClick={() => navigate(`/investing/stock-query?code=${s.code}`)}
                        className="border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="px-3 py-2.5 font-mono text-blue-600">{s.code}</td>
                        <td className="px-3 py-2.5 font-medium text-gray-900">{s.name}</td>
                        <td className="px-3 py-2.5">{s.price.toFixed(2)}</td>
                        <td className={`px-3 py-2.5 font-medium ${s.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                        </td>
                        <td className="px-3 py-2.5">{s.pe > 0 ? s.pe.toFixed(1) : '—'}</td>
                        <td className="px-3 py-2.5">{s.pb > 0 ? s.pb.toFixed(2) : '—'}</td>
                        <td className="px-3 py-2.5">{(s.totalMarketCap / 1e8).toFixed(1)}亿</td>
                        <td className="px-3 py-2.5">{s.turnoverRate.toFixed(2)}%</td>
                        <td className="px-3 py-2.5">{s.volumeRatio.toFixed(2)}</td>
                        <td className="px-3 py-2.5">{s.amplitude.toFixed(2)}%</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">{signalBadges(s.signals)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
