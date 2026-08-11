# Session State — 2026-08-11

## 项目概述

**Economics & Investing** — 面向 A 股的"经济 + 投资"学习型 Web 应用

- 仓库：https://github.com/oldman1969/economics_web
- 分支：`main`
- Dev server: `npm run dev` → `http://localhost:5173/`

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS 3 |
| 路由 | React Router v6 |
| 图表 | ECharts 5 (Apache) |
| 图标 | Lucide React |
| 股票数据 | 东方财富 API（JSONP 方式，绕过 CORS） |

## 页面清单（5页 + 路由）

| 路径 | 页面 | 状态 |
|------|------|------|
| `/` | Home — 经济学/投资两大卡片入口 | ✅ |
| `/economics/economic-machine` | 经济机器视频（B站 BV1kx41117mE）+ 5个可展开知识点 | ✅ |
| `/investing` | InvestingHome — 投资板块首页，三个模块导航 | ✅ |
| `/investing/beginner-guide` | 炒股入门教程（7章，左右分栏） | ✅ |
| `/investing/stock-query` | 股票实时查询（搜索+行情+K线/折线图+自选股） | ✅ 待验证 |
| `/investing/stock-advice` | 投资建议（占位页，显示"即将上线"） | ⏳ |

## 关键文件

```
src/
├── services/stockApi.ts          # JSONP 调东方财富 API（行情/K线/搜索）
├── hooks/useStockData.ts         # 股票数据 Hook
├── types/index.ts                # StockInfo, KlineData, StockSearchItem, GuideChapter
├── utils/constants.ts            # NAV_ITEMS, ECONOMIC_MACHINE_VIDEO_BVID, ECONOMIC_KEY_POINTS
├── components/layout/Navbar.tsx   # 顶部导航（含下拉菜单，移动端折叠）
├── components/layout/Layout.tsx   # 整体布局 + 页脚
├── pages/Home.tsx                # 首页
├── pages/economics/EconomicMachine.tsx  # 经济机器视频页
└── pages/investing/
    ├── InvestingHome.tsx          # 投资首页
    ├── BeginnerGuide.tsx          # 炒股教程（含简易 Markdown 渲染器）
    ├── StockQuery.tsx             # 股票查询
    └── StockAdvice.tsx            # 投资建议占位
```

## 股票 API 方案（重要）

**用 JSONP 从浏览器直调东方财富 API，不走 Vite 代理。**

原因：
- Vite 代理走了 Node.js 服务端 DNS → 被公司网关拦截
- JSONP 从浏览器发起 → 用用户自己的 DNS → 应该能通
- JSONP 绕过 CORS（`<script>` 标签不受同源策略限制）

三个 API 端点（均支持 `&callback=fnName` JSONP 参数）：
1. 实时行情：`push2.eastmoney.com/api/qt/stock/get`
2. K线数据：`push2his.eastmoney.com/api/qt/stock/kline/get`
3. 股票搜索：`searchapi.eastmoney.com/api/suggest/get`

`vite.config.ts` 已恢复为简洁版本（无代理）。

## 当前待验证

股票查询页面（`/investing/stock-query`）— 用户需要重启 dev server 后测试：
- 搜索"立讯"能否出现"立讯精密"
- 选择股票后能否显示行情和 K 线图

## 部署计划

- 以后部署到云服务器（有域名）
- 需要 Nginx 做 API 代理转发（生产环境 CORS 问题）
- 尚未配置 Dockerfile/Nginx config

## 注意事项

- 用户不要自动推送 Git，提交可以自动，推送自己做
- TypeScript 6.0.3，tsconfig 中 `erasableSyntaxOnly` 和 `baseUrl` 已移除
- 中文标题已全部改为英文 "Economics & Investing"
- `verbatimModuleSyntax: true` — type imports 用 `import type { ... }`
