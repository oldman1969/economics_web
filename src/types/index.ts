export interface StockInfo {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  preClose: number;
  volume: number;
  amount: number;
}

export interface KlineData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface StockSearchItem {
  code: string;
  name: string;
  market: 'SH' | 'SZ' | 'BJ';
}

export interface GuideChapter {
  id: string;
  title: string;
  content: string;
}

/** 全市场股票列表项 */
export interface StockListItem {
  code: string;
  name: string;
  // 行情（可用）
  price: number;
  changePercent: number;
  turnoverRate: number; // 换手率 %
  volumeRatio: number; // 量比
  amount: number; // 成交额（元）
  volume: number; // 成交量（手）
  amplitude: number; // 振幅 %
  // 估值指标
  pe: number; // 市盈率，0 表示亏损或无
  totalMarketCap: number; // 总市值（元）
  pb: number; // 市净率
  floatMarketCap: number; // 流通市值（元）
  totalShares: number; // 总股本（股）
  floatShares: number; // 流通股本（股）
  // 财务指标
  netProfit: number; // 净利润（元）
  grossMargin: number; // 毛利率 %
  eps: number; // 每股收益（元）
  holderCount: number; // 股东户数
  netProfitGrowth: number; // 净利润增长率 %
  netMargin: number; // 净利率 %
  bps: number; // 每股净资产（元）
  dividendYield: number; // 股息率 %
  revenue: number; // 营业收入（元）
  cashFlowPerShare: number; // 每股现金流（元）
  debtRatio: number; // 资产负债率 %
  roe: number; // 净资产收益率 %
  revenueGrowth: number; // 营收增长率 %
}

/** 范围条件 */
export interface RangeCond {
  min: number | null;
  max: number | null;
}

/** 选股条件 */
export interface ScreenerCondition {
  scope: MarketScope;
  // 估值指标
  pe: RangeCond;
  totalMarketCap: RangeCond;
  pb: RangeCond;
  floatMarketCap: RangeCond;
  totalShares: RangeCond;
  floatShares: RangeCond;
  // 财务指标
  netProfit: RangeCond;
  grossMargin: RangeCond;
  eps: RangeCond;
  holderCount: RangeCond;
  netProfitGrowth: RangeCond;
  netMargin: RangeCond;
  bps: RangeCond;
  dividendYield: RangeCond;
  revenue: RangeCond;
  cashFlowPerShare: RangeCond;
  debtRatio: RangeCond;
  roe: RangeCond;
  revenueGrowth: RangeCond;
  // 技术面 — 行情指标
  price: RangeCond; // 股价
  change: RangeCond; // 涨跌幅 %
  limitUpDown: RangeCond; // 涨跌停
  turnover: RangeCond; // 换手率 %
  volumeRatio: RangeCond; // 量比
  bigOrder: RangeCond; // 大单
  amplitude: RangeCond; // 振幅 %
  mainInflow: boolean; // 主力资金净流入
  amount: RangeCond; // 成交额（亿）
  volume: RangeCond; // 成交量（万手）
  commissionRatio: RangeCond; // 委比
  // 技术面 — 技术指标
  bullsAlignment: boolean; // 均线多头排列
  bollBreakout: boolean; // BOLL 突破
  macdGoldenCross: boolean; // MACD 金叉
  kdjGoldenCross: boolean; // KDJ 金叉
  rsiOversold: boolean; // RSI 超卖
  wrOversold: boolean; // WR 超卖
  klinePattern: boolean; // 经典K线形态
  // 特色指标 — 亮点
  shareholderChange: boolean; // 增减持
  nationalTeam: boolean; // 国家队持股
  // 特色指标 — 风险
  unlock: boolean; // 解禁
  dragonTiger: boolean; // 龙虎榜
  privatePlacement: boolean; // 定向增发
  // 特色指标 — 其他
  institutionRating: boolean; // 机构评级
  chipDistribution: boolean; // 筹码分布
  beatMarket: boolean; // 跑赢大盘
  marketAttention: boolean; // 市场关注度
  highTransfer: boolean; // 高送转
  marketActivity: boolean; // 市场活跃度
  bullBearLine: boolean; // 牛熊线
  masterPick: boolean; // 模拟赛高手选股
}

export type MarketScope = 'all' | 'sh-main' | 'sz-main' | 'chinext' | 'star';

/** 保存的选股分组 */
export interface SavedGroup {
  id: string;
  name: string;
  condition: ScreenerCondition;
  createdAt: string;
}

/** 技术指标计算结果（用于结果表格展示信号） */
export interface ScreenerResultItem extends StockListItem {
  signals: {
    macd: boolean;
    kdj: boolean;
    rsi: boolean;
    bulls: boolean;
    boll: boolean;
    wr: boolean;
  };
}

/** AI 配置（OpenAI 兼容接口） */
export interface AiConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}

/** 聊天消息 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  reasoning?: string; // 思考过程（深度思考模型）
}
