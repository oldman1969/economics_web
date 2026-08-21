# AI & Economics & Investing

从本质理解 AI 与经济 —— 不追热点，只讲透「为什么」。

两个认知体系：

- **AI**：历史脉络 → 技术解剖 → 数学底座 → Agent 工程
- **经济**：四层认知金字塔（经济 → 公司 → 市场 → 自己）

## 产品定位

市面上不缺工具和资讯，缺的是「从本质建立认知」。这个网站用**两个认知体系**帮新手理解 AI 与经济：

```
AI：四步学习路径                 经济：四层认知金字塔
① 历史脉络  ← 为什么出现          第四层 认识自己  ← 风险/情绪
② 技术解剖  ← 手算 + 代码          第三层 认识市场  ← 估值/牛熊
③ 数学底座  ← 严格推导             第二层 认识公司  ← 所有权/财报
④ Agent 工程 ← 工程落地            第一层 认识经济  ← 交易/信贷
```

## 功能

### AI · 深入理解 AI（47 篇文章 + 12 段 MATLAB）
- 📜 历史脉络：8 课 AI 技术史（1943–至今）
- 🔬 技术解剖：21 篇关键技术深度解剖（手算 + 数学 + MATLAB）
- 🤖 Agent 工程：李博杰《深入理解 AI Agent》10 章研读
- 👁️ 多模态：CLIP / LLaVA / ViT / Whisper / 视频（1 篇发展史 + 5 篇深度解剖）
- 📖 参考资料：Prince《理解深度学习》等教材导读
- 🖥️ MATLAB 代码：12 段可独立运行的手算仿真脚本

### 经济 · 四层认知金字塔（16 篇文章 + 1 视频）
- 🎬 经济学（第一层）：经济机器视频 + 信贷、央行、周期、通胀 5 篇文章
- 🏢 公司的本质（第二层）：股票、商业模式、好公司、财报 4 篇
- 📈 认识市场（第三层）：估值、市场先生、牛熊 3 篇
- 🧘 认识自己（第四层）：本金、仓位、情绪、复利 4 篇

### 工具
- 📊 **股票实时查询** — 搜索代码/名称，实时行情、K 线图、自选股收藏
- 🔍 **智能选股** — 估值 / 财务 / 技术面多维度筛选，支持保存分组、指标悬停提示
- 💡 **AI 分析** — 个股诊断 + 多轮对话，自备 OpenAI 兼容 Key，支持深度思考展示

### 学习资源
- 📚 开源库（AKShare / Backtrader / Qlib 等）
- 📖 长线书单（7 本书 + 读书笔记）
- ⚡ 短线经验（6 篇通俗文章 + 案例讲解）

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS |
| 后端 | Python FastAPI + AKShare |
| 图表 | ECharts |
| 技术指标 | 自研（MACD / KDJ / RSI / BOLL / WR / 均线） |
| 内容渲染 | react-markdown + KaTeX（公式）+ highlight.js（代码高亮） |
| AI | OpenAI 兼容接口（DeepSeek / 智谱 / 通义等，用户自备 Key） |

## 开始

### 前端

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 生产构建 → dist/
```

### 内容同步（AI 模块）

AI 模块内容来自 [know_ai](https://github.com/oldman1969/know_ai) 仓库，一条命令自动拉取：

```bash
npm run sync:ai
```

- 首次运行会 clone know_ai 到项目内 `know_ai/`（已 gitignore），之后自动 `git pull`
- GitHub 不可达时，自动回退到兄弟目录 `../know_ai` 的本地副本
- 新增文章会自动出现在网站，标题/摘要自动派生；如需精修，编辑 `src/content/ai/overrides.ts`

### 后端（选股器财务筛选需要）

```bash
cd server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000   # http://localhost:8000/docs
```

## 项目结构

```
├── src/                    # 前端（React）
│   ├── components/         # Navbar、Layout、通用组件、Markdown 渲染
│   ├── content/ai/         # AI 内容（vendor 自 know_ai，清单自动派生）
│   ├── hooks/              # useStockData、useAiConfig
│   ├── services/           # stockApi（东方财富 JSONP + 后端）、aiService
│   ├── types/              # TypeScript 类型
│   ├── utils/              # 常量、技术指标、文章数据、markdown 渲染
│   └── pages/              # 首页、经济学、投资、AI、学习资源
├── scripts/sync-ai.mjs     # know_ai 内容同步脚本
└── server/                 # 后端（FastAPI + AKShare）
    ├── main.py             # FastAPI 入口
    ├── akshare_api.py      # 数据封装（腾讯 + 同花顺）
    └── requirements.txt
```

## 数据源说明

| 数据 | 来源 | 方式 |
|------|------|------|
| 全市场列表（行情/估值） | 腾讯 | 后端 AKShare |
| 财务指标 | 同花顺 | 后端 AKShare |
| K 线 | 腾讯 | 后端 AKShare |
| 股票详情 / 搜索 / 主力资金 | 东方财富 | 前端 JSONP 直连 |
| AI 学习内容 | know_ai 仓库 | `npm run sync:ai` 拉取 |

> 后端数据源刻意避开了东方财富（该域名在公司网络下被限制）。浏览器能直连东财（走系统代理），但 Python/Node.js 进程直连会被重置。

## 部署

- **前端**：`dist/` 静态文件，Nginx 托管
- **后端**：`server/` 用 uvicorn 运行，Nginx 反向代理 `/api` 到后端端口
- 生产环境需把 `src/services/stockApi.ts` 里的 `API_BASE_URL` 改成服务器地址
