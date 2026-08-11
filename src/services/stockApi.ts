import type { StockInfo, KlineData, StockSearchItem } from '@/types';

/** JSONP helper — bypasses CORS by loading data as a script */
function jsonp<T>(url: string, timeout = 8000): Promise<T> {
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

    script.src = `${url}&callback=${callbackName}`;
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
