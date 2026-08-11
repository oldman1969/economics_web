# Economics & Investing

经济与投资学习平台 — 帮助每个人理解经济、学会投资。

## 功能

### 经济学
- 🎬 **《经济机器是怎样运行的》** — Ray Dalio / 桥水基金出品，30 分钟动画讲解经济运行原理（B 站视频源）

### 投资（A 股）
- 📖 **炒股入门教程** — 7 章从零开始：什么是股票、A 股入门、开户流程、基础术语、如何看盘、交易实操、风险控制
- 📊 **股票实时查询** — 搜索 A 股代码或名称，查看实时行情、K 线图、自选股收藏
- 💡 **投资建议** — 即将上线（AI 诊股、基本面分析、技术指标分析）

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite |
| 样式 | Tailwind CSS |
| 路由 | React Router v6 |
| 图表 | ECharts |
| 股票数据 | 东方财富 API（JSONP） |

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
├── utils/               # 常量
└── pages/
    ├── Home.tsx                       # 首页
    ├── economics/
    │   └── EconomicMachine.tsx        # 经济机器视频
    └── investing/
        ├── InvestingHome.tsx          # 投资首页
        ├── BeginnerGuide.tsx          # 炒股入门教程
        ├── StockQuery.tsx             # 股票查询
        └── StockAdvice.tsx            # 投资建议
```

## 部署

构建产物在 `dist/` 目录，可直接部署到 Nginx 等静态服务器。需要配置 Nginx 反向代理处理股票 API 的跨域问题。
