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
