import { useState, useCallback } from 'react';
import type { StockInfo, KlineData, StockSearchItem } from '@/types';
import { fetchStockInfo, fetchKline, searchStocks } from '@/services/stockApi';

export function useStockData() {
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [klines, setKlines] = useState<KlineData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStock = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const [info, klineData] = await Promise.all([
        fetchStockInfo(code),
        fetchKline(code),
      ]);
      if (!info) {
        setError('未找到该股票，请检查代码是否正确');
        setStockInfo(null);
        setKlines([]);
      } else {
        setStockInfo(info);
        setKlines(klineData);
      }
    } catch {
      setError('数据加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (keyword: string): Promise<StockSearchItem[]> => {
    if (!keyword.trim()) return [];
    return searchStocks(keyword);
  }, []);

  return { stockInfo, klines, loading, error, loadStock, search };
}
