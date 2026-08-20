import type { StockInfo, KlineData, StockSearchItem, StockListItem, MarketScope } from '@/types';

/** JSONP helper — bypasses CORS by loading data as a script */
function jsonp<T>(url: string, timeout = 8000, callbackParam = 'cb'): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = `_jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP timeout'));
    }, timeout);

    function cleanup() {
      clearTimeout(timer);
      delete (window as unknown as Record<string, unknown>)[callbackName];
      script.remove();
    }

    (window as unknown as Record<string, unknown>)[callbackName] = (data: T) => {
      cleanup();
      resolve(data);
    };

    script.src = `${url}&${callbackParam}=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP request failed'));
    };
    document.head.appendChild(script);
  });
}

function getMarketCode(code: string): string {
  if (code.startsWith('6')) return '1';
  if (code.startsWith('0') || code.startsWith('3')) return '0';
  if (code.startsWith('8') || code.startsWith('4')) return '0';
  return '1';
}

function toEastMoneyCode(code: string): string {
  return `${getMarketCode(code)}.${code}`;
}

const FIELDS = 'f43,f44,f45,f46,f47,f48,f57,f58,f60,f169,f170';

export async function fetchStockInfo(code: string): Promise<StockInfo | null> {
  try {
    const secid = toEastMoneyCode(code);
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=${FIELDS}`;
    const data = await jsonp<{ data: Record<string, number> }>(url);
    const d = data?.data;
    if (!d) return null;
    return {
      code: String(d.f57),
      name: String(d.f58),
      price: (d.f43 ?? 0) / 100,
      change: (d.f169 ?? 0) / 100,
      changePercent: (d.f170 ?? 0) / 100,
      high: (d.f44 ?? 0) / 100,
      low: (d.f45 ?? 0) / 100,
      open: (d.f46 ?? 0) / 100,
      preClose: (d.f60 ?? 0) / 100,
      volume: d.f47 ?? 0,
      amount: d.f48 ?? 0,
    };
  } catch (err) {
    console.error('[stockApi] fetchStockInfo error', err);
    return null;
  }
}

export async function fetchKline(
  code: string,
  period: 'day' | 'week' | 'month' = 'day',
  count = 120
): Promise<KlineData[]> {
  try {
    const secid = toEastMoneyCode(code);
    const kltMap = { day: 101, week: 102, month: 103 };
    const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&klt=${kltMap[period]}&fqt=1&lmt=${count}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57`;
    const data = await jsonp<{ data: { klines: string[] } }>(url);
    const klines = data?.data?.klines;
    if (!klines) return [];
    return klines.map((line: string) => {
      const parts = line.split(',');
      return {
        date: parts[0],
        open: Number(parts[1]),
        close: Number(parts[2]),
        high: Number(parts[3]),
        low: Number(parts[4]),
        volume: Number(parts[5]),
      };
    });
  } catch (err) {
    console.error('[stockApi] fetchKline error', err);
    return [];
  }
}

export async function searchStocks(keyword: string): Promise<StockSearchItem[]> {
  try {
    const url = `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(keyword)}&type=14&token=D43BF722C8E33BDC906FB84D85E326E8&count=10`;
    const data = await jsonp<{ QuotationCodeTable?: { Data?: Array<{ Code: string; Name: string; MarketId: string }> } }>(url);
    const items = data?.QuotationCodeTable?.Data;
    if (!items) return [];
    return items.map((item) => ({
      code: item.Code,
      name: item.Name,
      market: item.MarketId === '1' ? 'SH' : item.MarketId === '0' ? 'SZ' : 'BJ',
    }));
  } catch (err) {
    console.error('[stockApi] searchStocks error', err);
    return [];
  }
}

/** 东方财富 clist 接口的股票池编码 */
const FS_MAP: Record<MarketScope, string> = {
  all: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23',
  'sh-main': 'm:1+t:2',
  'sz-main': 'm:0+t:6',
  chinext: 'm:0+t:80',
  star: 'm:1+t:23',
};

const UT = 'bd1d9ddb04089700cf9c27f6f7426281';
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 拉取股票列表（东方财富 clist，JSONP 直连；受反爬限流，最多拉市值前 900 只） */
export async function fetchStockList(scope: MarketScope): Promise<StockListItem[]> {
  try {
    const fs = FS_MAP[scope].replace(/\+/g, '%2B');
    const fields = 'f2,f3,f5,f6,f7,f8,f9,f10,f12,f14,f20,f21,f23';
    const num = (v: unknown): number => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const all: StockListItem[] = [];
    const MAX_PAGES = 9; // 前端 JSONP 反爬限流，最多 9 页（市值前 900 只）
    for (let pn = 1; pn <= MAX_PAGES; pn++) {
      const url = `https://push2.eastmoney.com/api/qt/clist/get?pn=${pn}&pz=100&po=1&np=1&ut=${UT}&fltt=2&invt=2&fid=f20&fs=${fs}&fields=${fields}`;
      const data = await jsonp<{ data?: { diff?: Array<Record<string, unknown>> } }>(url);
      const diff = data?.data?.diff;
      if (!Array.isArray(diff) || diff.length === 0) break;
      for (const item of diff) {
        const pe = num(item.f9);
        all.push({
          code: String(item.f12),
          name: String(item.f14),
          price: num(item.f2),
          changePercent: num(item.f3),
          turnoverRate: num(item.f8),
          pe: pe > 0 ? pe : 0,
          volumeRatio: num(item.f10),
          amount: num(item.f6),
          volume: num(item.f5),
          amplitude: num(item.f7),
          totalMarketCap: num(item.f20),
          pb: num(item.f23),
          floatMarketCap: num(item.f21),
          // 以下字段当前数据源（东方财富 clist）拿不到，先填 0，待接入其他数据源
          totalShares: 0,
          floatShares: 0,
          netProfit: 0,
          grossMargin: 0,
          eps: 0,
          holderCount: 0,
          netProfitGrowth: 0,
          netMargin: 0,
          bps: 0,
          dividendYield: 0,
          revenue: 0,
          cashFlowPerShare: 0,
          debtRatio: 0,
          roe: 0,
          revenueGrowth: 0,
        });
      }
      if (diff.length < 100) break; // 最后一页
      await sleep(600); // 页间隔，避免触发限流
    }
    console.log('[stockApi] fetchStockList count =', all.length);
    return all.filter((s) => s.code);
  } catch (err) {
    console.error('[stockApi] fetchStockList error', err);
    return [];
  }
}

/** 主力资金净流入（当日，单位元），拿不到返回 null */
export async function fetchMainInflow(code: string): Promise<number | null> {
  try {
    const secid = toEastMoneyCode(code);
    const url = `https://push2.eastmoney.com/api/qt/stock/fflow/daykline/get?lmt=1&klt=101&secid=${secid}&fields1=f1,f2,f3,f7&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63`;
    const data = await jsonp<{ data?: { klines?: string[] } }>(url);
    const klines = data?.data?.klines;
    if (!klines || klines.length === 0) return null;
    const parts = klines[klines.length - 1].split(',');
    return Number(parts[1]) || 0;
  } catch (err) {
    console.error('[stockApi] fetchMainInflow error', err);
    return null;
  }
}

const API_BASE_URL = 'http://localhost:8000';

/** 拉取全市场列表（后端 AKShare，腾讯源，不限流） */
export async function fetchStockListBackend(): Promise<StockListItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stock/list`);
    const data = await res.json();
    if (data.code !== 0 || !Array.isArray(data.data)) return [];
    return data.data.map((item: Record<string, unknown>) => ({
      code: String(item.code ?? ''),
      name: String(item.name ?? ''),
      price: Number(item.price) || 0,
      changePercent: Number(item.changePercent) || 0,
      turnoverRate: Number(item.turnoverRate) || 0,
      volumeRatio: Number(item.volumeRatio) || 0,
      amount: Number(item.amount) || 0,
      volume: Number(item.volume) || 0,
      amplitude: Number(item.amplitude) || 0,
      pe: Number(item.pe) || 0,
      totalMarketCap: Number(item.totalMarketCap) || 0,
      floatMarketCap: Number(item.floatMarketCap) || 0,
      // 后端 list 暂未提供的字段，先填 0
      pb: 0,
      totalShares: 0,
      floatShares: 0,
      roe: 0, revenue: 0, revenueGrowth: 0, netProfit: 0, netProfitGrowth: 0,
      eps: 0, bps: 0, debtRatio: 0, cashFlowPerShare: 0,
      grossMargin: 0, holderCount: 0, netMargin: 0, dividendYield: 0,
    }));
  } catch (err) {
    console.error('[stockApi] fetchStockListBackend error', err);
    return [];
  }
}

/** 拉取个股财务指标（后端 AKShare，同花顺源） */
export async function fetchFinancialBackend(code: string): Promise<Partial<StockListItem>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stock/financial/${code}`);
    const data = await res.json();
    if (data.code !== 0) return {};
    return {
      netProfit: Number(data.data.netProfit) || 0,
      netProfitGrowth: Number(data.data.netProfitGrowth) || 0,
      revenue: Number(data.data.revenue) || 0,
      revenueGrowth: Number(data.data.revenueGrowth) || 0,
      eps: Number(data.data.eps) || 0,
      bps: Number(data.data.bps) || 0,
      cashFlowPerShare: Number(data.data.cashFlowPerShare) || 0,
      netMargin: Number(data.data.netMargin) || 0,
      grossMargin: Number(data.data.grossMargin) || 0,
      roe: Number(data.data.roe) || 0,
      debtRatio: Number(data.data.debtRatio) || 0,
    };
  } catch (err) {
    console.error('[stockApi] fetchFinancialBackend error', err);
    return {};
  }
}
