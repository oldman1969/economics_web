import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as echarts from 'echarts';
import { useStockData } from '@/hooks/useStockData';
import type { StockSearchItem } from '@/types';
import { Search, Star, StarOff, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const FAVORITES_KEY = 'stock_favorites';

export default function StockQuery() {
  const { stockInfo, klines, loading, error, loadStock, search } = useStockData();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [chartType, setChartType] = useState<'kline' | 'line'>('kline');
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save favorites
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Preload stock from URL ?code=xxx
  useEffect(() => {
    const code = searchParams.get('code');
    if (code && /^\d{6}$/.test(code)) {
      setKeyword(code);
      loadStock(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const toggleFavorite = (code: string) => {
    setFavorites((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Search with debounce
  const onSearchChange = useCallback(
    (value: string) => {
      setKeyword(value);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      if (!value.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      searchTimer.current = setTimeout(async () => {
        const results = await search(value);
        setSearchResults(results);
        setShowResults(true);
      }, 300);
    },
    [search]
  );

  const selectStock = (item: StockSearchItem) => {
    setKeyword(`${item.name} (${item.code})`);
    setShowResults(false);
    loadStock(item.code);
  };

  // Enter key: select first result, or load by code directly
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    // 有搜索结果 → 选第一个
    if (searchResults.length > 0) {
      selectStock(searchResults[0]);
      return;
    }
    // 否则如果输入是 6 位数字代码 → 直接查询
    const trimmed = keyword.trim();
    if (/^\d{6}$/.test(trimmed)) {
      loadStock(trimmed);
      setShowResults(false);
    }
  };

  // Chart
  useEffect(() => {
    if (!chartRef.current || klines.length === 0) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const dates = klines.map((k) => k.date);
    const values = klines.map((k) => [k.open, k.close, k.low, k.high]);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      grid: {
        left: '3%',
        right: '3%',
        top: '10%',
        bottom: '8%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#9ca3af', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        scale: true,
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        axisLabel: { color: '#9ca3af', fontSize: 11 },
      },
      ...(chartType === 'kline'
        ? {
            series: [
              {
                type: 'candlestick',
                data: values,
                itemStyle: {
                  color: '#ef4444',
                  color0: '#22c55e',
                  borderColor: '#ef4444',
                  borderColor0: '#22c55e',
                },
              },
            ],
          }
        : {
            series: [
              {
                type: 'line',
                data: klines.map((k) => k.close),
                smooth: true,
                lineStyle: { color: '#3b82f6', width: 2 },
                itemStyle: { color: '#3b82f6' },
                showSymbol: false,
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(59,130,246,0.2)' },
                    { offset: 1, color: 'rgba(59,130,246,0)' },
                  ]),
                },
              },
            ],
          }),
    };

    chartInstance.current.setOption(option, true);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [klines, chartType]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          股票实时查询
        </h1>
        <p className="text-gray-500">搜索 A 股代码或名称，查看实时行情与 K 线图</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder="输入股票代码或名称，如 600519 或 贵州茅台"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Search results dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {searchResults.map((item) => (
              <button
                key={item.code}
                onMouseDown={() => selectStock(item)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{item.code}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {item.market === 'SH' ? '沪市' : item.market === 'SZ' ? '深市' : '北交所'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="max-w-xl mx-auto mb-8">
          <p className="text-xs text-gray-400 mb-2">自选股</p>
          <div className="flex flex-wrap gap-2">
            {favorites.map((code) => (
              <button
                key={code}
                onClick={() => loadStock(code)}
                className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-xl mx-auto text-center py-10">
          <p className="text-gray-500">{error}</p>
        </div>
      )}

      {/* Stock info */}
      {stockInfo && !loading && (
        <div className="space-y-6">
          {/* Info cards */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">{stockInfo.name}</h2>
                  <span className="text-sm text-gray-400">{stockInfo.code}</span>
                </div>
              </div>
              <button
                onClick={() => toggleFavorite(stockInfo.code)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {favorites.includes(stockInfo.code) ? (
                  <Star size={20} className="text-yellow-500 fill-yellow-500" />
                ) : (
                  <StarOff size={20} className="text-gray-300" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">最新价</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stockInfo.price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">涨跌额</p>
                <p
                  className={`text-lg font-semibold flex items-center gap-1 ${
                    stockInfo.change > 0
                      ? 'text-red-500'
                      : stockInfo.change < 0
                      ? 'text-green-500'
                      : 'text-gray-500'
                  }`}
                >
                  {stockInfo.change > 0 ? (
                    <TrendingUp size={16} />
                  ) : stockInfo.change < 0 ? (
                    <TrendingDown size={16} />
                  ) : (
                    <Minus size={16} />
                  )}
                  {stockInfo.change > 0 ? '+' : ''}
                  {stockInfo.change.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">涨跌幅</p>
                <p
                  className={`text-lg font-semibold ${
                    stockInfo.changePercent > 0
                      ? 'text-red-500'
                      : stockInfo.changePercent < 0
                      ? 'text-green-500'
                      : 'text-gray-500'
                  }`}
                >
                  {stockInfo.changePercent > 0 ? '+' : ''}
                  {stockInfo.changePercent.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">成交量(手)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(stockInfo.volume / 100).toFixed(0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">今开</p>
                <p className="text-sm font-medium text-gray-700">{stockInfo.open.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">最高</p>
                <p className="text-sm font-medium text-red-500">{stockInfo.high.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">最低</p>
                <p className="text-sm font-medium text-green-500">{stockInfo.low.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">昨收</p>
                <p className="text-sm font-medium text-gray-700">{stockInfo.preClose.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Chart toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('kline')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'kline'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              K 线图
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              收盘折线
            </button>
          </div>

          {/* Chart */}
          <div className="card p-4">
            <div ref={chartRef} className="w-full" style={{ height: 420 }} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!stockInfo && !loading && !error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-400">在上方搜索框中输入股票代码或名称</p>
          <p className="text-gray-300 text-sm mt-1">例如：600519（贵州茅台）、000001（平安银行）</p>
        </div>
      )}
    </div>
  );
}
