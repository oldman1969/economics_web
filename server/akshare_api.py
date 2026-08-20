"""AKShare 数据封装：拉数据 + 字段映射成前端英文字段

数据源说明（避开被网络限制的东方财富）：
- 全市场列表：腾讯 stock_zh_a_spot_tx
- 财务指标：同花顺 stock_financial_abstract_ths
- K线：腾讯 stock_zh_a_hist_tx
"""
import re
import akshare as ak


def _num(v):
    """安全转数字，处理带单位（亿/万/%）的字符串，失败返回 0.0"""
    try:
        if v is None or isinstance(v, bool):
            return 0.0
        if isinstance(v, (int, float)):
            return float(v)
        s = str(v).strip()
        if s in ('', '-', '--', 'False', 'None', 'nan'):
            return 0.0
        m = re.search(r'-?\d+\.?\d*', s)
        if not m:
            return 0.0
        val = float(m.group())
        if '亿' in s:
            val *= 1e8
        elif '万' in s:
            val *= 1e4
        return val
    except (ValueError, TypeError):
        return 0.0


def _to_tx_code(code):
    """把 6 位代码转成腾讯带前缀格式（sh/sz/bj）"""
    code = str(code).strip()
    if code.startswith('6'):
        return 'sh' + code
    if code.startswith(('0', '3')):
        return 'sz' + code
    if code.startswith(('8', '4')):
        return 'bj' + code
    return 'sz' + code


def get_stock_list():
    """全市场 A 股列表（行情 + 估值，腾讯源）"""
    df = ak.stock_zh_a_spot_tx()
    result = []
    for _, row in df.iterrows():
        code = str(row.get('code', ''))
        if code[:2] in ('sh', 'sz', 'bj'):
            code = code[2:]
        result.append({
            'code': code,
            'name': str(row.get('name', '')),
            'price': _num(row.get('zxj')),
            'changePercent': _num(row.get('zdf')),
            'turnoverRate': _num(row.get('hsl')),
            'volumeRatio': _num(row.get('lb')),
            'pe': _num(row.get('pe_ttm')),
            'totalMarketCap': _num(row.get('zsz')) * 1e8,   # 亿 → 元
            'floatMarketCap': _num(row.get('ltsz')) * 1e8,  # 亿 → 元
            'amount': _num(row.get('turnover')),
            'volume': _num(row.get('volume')),
            'amplitude': _num(row.get('zf')),
        })
    return result


def get_financial(code):
    """个股财务指标（同花顺源，最新一期）"""
    df = ak.stock_financial_abstract_ths(symbol=str(code), indicator='按报告期')
    if df is None or df.empty:
        return {}
    row = df.iloc[-1]  # 数据按时间正序，最后一行是最新一期
    return {
        'netProfit': _num(row.get('净利润')),
        'netProfitGrowth': _num(row.get('净利润同比增长率')),
        'revenue': _num(row.get('营业总收入')),
        'revenueGrowth': _num(row.get('营业总收入同比增长率')),
        'eps': _num(row.get('基本每股收益')),
        'bps': _num(row.get('每股净资产')),
        'cashFlowPerShare': _num(row.get('每股经营现金流')),
        'netMargin': _num(row.get('销售净利率')),
        'grossMargin': _num(row.get('销售毛利率')),
        'roe': _num(row.get('净资产收益率')),
        'debtRatio': _num(row.get('资产负债率')),
    }


def get_kline(code, start_date='20240101', end_date='20241231'):
    """个股日 K（腾讯源，前复权）"""
    df = ak.stock_zh_a_hist_tx(
        symbol=_to_tx_code(code),
        start_date=start_date,
        end_date=end_date,
        adjust='qfq',
    )
    result = []
    for _, row in df.iterrows():
        result.append({
            'date': str(row.get('date', '')),
            'open': _num(row.get('open')),
            'close': _num(row.get('close')),
            'high': _num(row.get('high')),
            'low': _num(row.get('low')),
            'volume': _num(row.get('volume')),
            'amount': _num(row.get('amount')),
        })
    return result
