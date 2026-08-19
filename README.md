# Economics & Investing

经济与投资学习平台 — 帮助每个人理解经济、学会投资。

## 功能

### 经济学
- 🎬 **《经济机器是怎样运行的》** — Ray Dalio / 桥水基金出品，30 分钟动画讲解经济运行原理（B 站视频源）

### 投资（A 股）
- 📖 **炒股入门教程** — 7 章从零开始：什么是股票、A 股入门、开户流程、基础术语、如何看盘、交易实操、风险控制
- 📊 **股票实时查询** — 搜索 A 股代码或名称，查看实时行情、K 线图、自选股收藏
- 🔍 **智能选股** — 多维度条件筛选，类似同花顺"动态分组"，支持保存分组：
  - 选股范围（沪深主板 / 创业板 / 科创板）
  - 估值指标（市盈率、总市值、市净率、流通市值等）
  - 财务指标（净利润、ROE、毛利率等，待接入数据源）
  - 技术面 · 行情指标（股价、涨跌幅、换手率、量比、振幅等）
  - 技术面 · 技术指标（均线、BOLL、MACD、KDJ、RSI、WR）
  - 特色指标（龙虎榜、机构评级、增减持等，待接入数据源）
  - 指标悬停提示
- 💡 **投资建议** — 即将上线（AI 诊股、基本面分析、技术指标分析）

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite |
| 样式 | Tailwind CSS |
| 路由 | React Router v6 |
| 图表 | ECharts |
| 股票数据 | 东方财富 API（JSONP 跨域） |
| 技术指标 | 自研（MACD / KDJ / RSI / BOLL / WR / 均线） |

## 开始

```bash
npm install
npm run dev      # 开发服务器 → http://localhost:5173
npm run build    # 生产构建 → dist/
```

## 项目结构

```
src/
├── components/layout/   # Navbar、Layout
├── hooks/               # useStockData
├── services/            # stockApi（东方财富 JSONP）
├── types/               # TypeScript 类型
├── utils/
│   ├── constants.ts     # 导航菜单、选股范围、经济知识点
│   └── indicators.ts    # 技术指标计算（MACD/KDJ/RSI/BOLL/WR/均线）
└── pages/
    ├── Home.tsx                       # 首页
    ├── economics/
    │   └── EconomicMachine.tsx        # 经济机器视频
    └── investing/
        ├── InvestingHome.tsx          # 投资首页
        ├── BeginnerGuide.tsx          # 炒股入门教程
        ├── StockQuery.tsx             # 股票查询
        ├── StockScreener.tsx          # 智能选股
        └── StockAdvice.tsx            # 投资建议
```

## 数据源说明

- **行情 / 估值**：东方财富 `clist` 接口（JSONP 跨域），开发阶段受反爬限流，选股仅覆盖市值前 900 只
- **股票详情 / K 线 / 搜索 / 主力资金**：东方财富 `stock/get`、`kline/get`、`suggest/get`、`fflow` 接口
- **财务指标 / 股本 / 特色指标**：当前数据源暂未提供，界面已预留（置灰禁用），待接入其他数据源

## 部署

构建产物在 `dist/` 目录，可直接部署到 Nginx 等静态服务器。

> 生产环境建议加后端代理 + 缓存：解决跨域、突破反爬限流、拉取全市场股票及财务数据。
