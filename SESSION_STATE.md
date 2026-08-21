# SESSION_STATE — 项目状态（新会话先读这个）

> 这是"Economics & Investing"项目的最新状态记录。新会话读完本文件，即可接上进度，不依赖历史对话。

## 项目概述

**从本质理解投资** — 面向 A 股新手的投资学习平台，核心是「四层认知金字塔」帮新手建立正确投资世界观。

- 仓库：https://github.com/oldman1969/economics_web
- 分支：main

## 架构（前后端分离）

```
前端 React（React 18 + TypeScript + Vite + Tailwind）
   │ HTTP（CORS 已开）
   ▼
后端 FastAPI + AKShare（Python）
   │
   ▼ 数据源
腾讯（行情/K线）+ 同花顺（财务）+ 东方财富（浏览器 JSONP 直连）
```

## 本地运行

```bash
# 前端
npm run dev          # http://localhost:5173

# 后端（选股器财务筛选需要）
cd server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000   # http://localhost:8000/docs
```

环境：Python 3.14.6，akshare 1.18.92

## 功能清单

### 四层认知金字塔（内容主线，16 篇 + 1 视频）
- 第一层 认识经济：经济机器视频 + 5 篇文章（信贷/央行/周期/通胀/传导）
- 第二层 认识公司：4 篇（股票/商业模式/好公司/财报）
- 第三层 认识市场：3 篇（估值/市场先生/牛熊）
- 第四层 认识自己：4 篇（本金/仓位/情绪/复利）

### 工具
- 股票实时查询：搜索 + 行情 + K线 + 自选股
- 智能选股：估值/财务/技术面筛选 + 保存分组 + 指标悬停提示
- AI 分析：个股诊断 + 多轮对话 + 深度思考展示，用户自备 OpenAI 兼容 Key

### 学习资源
- 开源库（AKShare/Backtrader/Qlib 等 7 个）
- 长线书单（7 本书 + 读书笔记）
- 短线经验（6 篇通俗文章 + 案例）

## 数据源（关键决策，务必记住）

**东方财富域名在公司网络下被限制**：浏览器走系统代理能直连（JSONP 成功），但 Python/Node.js 进程直连会被重置（Connection aborted / 502）。

因此：
- **前端直连东财**（JSONP）：股票详情 stock/get、搜索 suggest/get、主力资金 fflow —— 这些能用
- **后端避开东财**：改用腾讯 + 同花顺（AKShare 封装）
  - 全市场列表：腾讯 `stock_zh_a_spot_tx`
  - K线：腾讯 `stock_zh_a_hist_tx`
  - 财务指标：同花顺 `stock_financial_abstract_ths`（单只查询）

**财务筛选是两阶段**：全市场行情粗筛 → 候选集（≤200只）逐只查同花顺财务 → 财务筛选。

## 关键文件

```
src/
├── services/
│   ├── stockApi.ts          # 东方财富 JSONP + 后端调用（fetchStockListBackend/fetchFinancialBackend）
│   └── aiService.ts         # OpenAI 兼容接口（chat/chatStream/fetchModels/testConnection）
├── hooks/
│   ├── useStockData.ts      # 股票查询 Hook
│   └── useAiConfig.ts       # AI 配置（localStorage）
├── utils/
│   ├── economics.ts         # 第一层文章
│   ├── company.ts           # 第二层文章
│   ├── market.ts            # 第三层文章
│   ├── self.ts              # 第四层文章
│   ├── bookNotes.ts         # 7 本书读书笔记
│   ├── shortTermNotes.ts    # 6 篇短线文章
│   ├── resources.ts         # 学习资源数据
│   ├── indicators.ts        # 技术指标计算（MACD/KDJ/RSI/BOLL/WR/均线）
│   └── markdown.ts          # 通用 markdown 渲染
├── pages/
│   ├── Home.tsx             # 首页（四层金字塔导航）
│   ├── Resources.tsx        # 学习资源
│   ├── economics/           # EconomicsHome + ArticlePage(通用) + CompanyHome + MarketHome + SelfHome
│   └── investing/           # InvestingHome + BeginnerGuide + StockQuery + StockScreener + StockAdvice(AI)
└── types/index.ts           # 所有类型

server/
├── main.py                  # FastAPI（3接口 + CORS）
├── akshare_api.py           # 数据封装（腾讯+同花顺，字段映射）
└── requirements.txt
```

## 已完成

- ✅ 四层认知金字塔内容（16 篇 + 1 视频）
- ✅ 股票查询、智能选股（含财务筛选）、AI 分析
- ✅ 学习资源（开源库 + 书单 + 短线案例）
- ✅ Python 后端（FastAPI + AKShare），财务数据打通

## 待办 / 下一步

- ⏳ 特色指标接入（龙虎榜/增减持/解禁/机构评级，AKShare 有接口但未接入）
- ⏳ 股本字段（腾讯 list 无总股本/流通股本）
- ⏳ 股东户数、股息率（同花顺财务接口未返回）
- ⏳ 部署云服务器（前端静态 + 后端 uvicorn + Nginx 反代）
- ⏳ 模拟交易、投资笔记
- ⏳ AI 深度思考（reasoning）展示 —— 取决于用户模型是否返回 reasoning 字段，代码已兼容

## 注意事项

- `API_BASE_URL` 在 `src/services/stockApi.ts` 里（`http://localhost:8000`），部署时改成服务器地址
- 前端 `fetchStockListBackend` 依赖后端，后端没启动时选股器会报"未获取到股票列表"
- 选股器财务筛选是"候选集逐只查"，候选集 >200 只时只覆盖前 200 只
- 技术指标在前端算（indicators.ts），K线从后端腾讯拿（前端 fetchKline 目前还是东财，可切换）
- AI 分析 key 存 localStorage，不经过服务器
