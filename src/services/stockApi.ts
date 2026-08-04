import type { StockInfo, KlineData, StockSearchItem } from '@/types';
import axios from 'axios';

const API_BASE = 'https://push2.eastmoney.com/api/qt';

const http = axios.create({
  timeout: 10000,
});

function getMarketCode(code: string): string {
  if (code.startsWith('6')) return '1'; // 上海
  if (code.startsWith('0') || code.startsWith('3')) return '0'; // 深圳
  if (code.startsWith('8') || code.startsWith('4')) return '0'; // 北交所(用深市规则)
  return '1';
}

function toEastMoneyCode(code: string): string {
  const mkt = getMarketCode(code);
  return `${mkt}.${code}`;
}

export async function fetchStockInfo(code: string): Promise<StockInfo | null> {
  try {
    const secid = toEastMoneyCode(code);
    const { data } = await http.get(`${API_BASE}/stock/get`, {
      params: {
        secid,
        fields: 'f43,f44,f45,f46,f47,f48,f50,f51,f57,f58,f60,f116,f117,f169,f170',
      },
    });
    const d = data?.data;
    if (!d) return null;
    return {
      code: d.f57,
      name: d.f58,
      price: d.f43 / 100,
      change: d.f169 / 100,
      changePercent: d.f170 / 100,
      high: d.f44 / 100,
      low: d.f45 / 100,
      open: d.f46 / 100,
      preClose: d.f60 / 100,
      volume: d.f47,
      amount: d.f48,
    };
  } catch {
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
    const { data } = await http.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
      params: {
        secid,
        klt: kltMap[period],
        fqt: 1, // 前复权
        lmt: count,
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57',
      },
    });
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
  } catch {
    return [];
  }
}

export async function searchStocks(keyword: string): Promise<StockSearchItem[]> {
  try {
    const { data } = await http.get('https://searchapi.eastmoney.com/api/suggest/get', {
      params: {
        input: keyword,
        type: 14,
        token: 'D43BF722C8E33BDC906FB84D85E326E8',
        count: 10,
      },
    });
    const items = data?.QuotationCodeTable?.Data;
    if (!items) return [];
    return items.map((item: { Code: string; Name: string; MarketId: string }) => ({
      code: item.Code,
      name: item.Name,
      market: item.MarketId === '1' ? 'SH' : item.MarketId === '0' ? 'SZ' : 'BJ',
    }));
  } catch {
    return [];
  }
}
