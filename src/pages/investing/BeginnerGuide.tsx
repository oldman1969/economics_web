import { useState } from 'react';
import type { GuideChapter } from '@/types';

const CHAPTERS: GuideChapter[] = [
  {
    id: 'what-is-stock',
    title: '1. 什么是股票',
    content: `## 用最简单的话解释

想象你和朋友开了一家奶茶店，总共投入了 10 万元。你们把这 10 万元分成了 1 万份，每份 10 元。

**股票，就是你拥有这家奶茶店的一份所有权证明。**

如果你买了 1000 份（1000 股），你就拥有这家店 10% 的股份。店赚钱了，你可以分到 10% 的利润（这就是**分红**）；店越做越大，你手里的股份也会更值钱（这就是**股价上涨**）。

### 为什么公司要发行股票？

公司在发展过程中需要大量资金。比如开更多分店、研发新产品。融资有两种方式：
- **借钱**（银行贷款、发债）→ 要还利息
- **卖股份**（上市发行股票）→ 不用还，但利润要分给股东

上市就是把公司的股份拿到交易所去公开买卖，任何人都可以成为这家公司的股东。

### 买股票赚什么钱？

| 方式 | 说明 | 例子 |
|------|------|------|
| 股价上涨 | 低价买、高价卖，赚差价 | 10元买 → 15元卖，赚5元/股 |
| 现金分红 | 公司把利润分给股东 | 每股分0.5元，你有1000股就是500元 |

### 风险在哪里？

股票不是存款，价格会波动。公司经营不善、行业不景气、经济下行——都可能让股价下跌。**你投入的钱可能会亏损。**`,
  },
  {
    id: 'a-share-basics',
    title: '2. A股市场入门',
    content: `## A 股是什么？

A 股就是在中国内地上市交易的股票，用人民币计价和交易。与之对应的是港股（在香港上市）和美股（在美国上市）。

### 三大交易所

| 交易所 | 简称 | 主要板块 |
|--------|------|----------|
| 上海证券交易所 | 上交所 | 主板（60xxxx）、科创板（688xxx） |
| 深圳证券交易所 | 深交所 | 主板（00xxxx）、创业板（300xxx） |
| 北京证券交易所 | 北交所 | 专精特新中小企业（8xxxxx） |

### 交易规则速览

- **交易时间**：周一至周五（节假日休市）
  - 集合竞价：9:15 — 9:25
  - 连续竞价：9:30 — 11:30，13:00 — 15:00
- **最小交易单位**：1 手 = 100 股（买入必须是 100 的整数倍）
- **T+1 制度**：今天买入的股票，最早明天才能卖出（当天不能卖）
- **涨跌停限制**：主板 ±10%，创业板/科创板 ±20%，北交所 ±30%
- **交易费用**：印花税（卖出时 0.05%）+ 佣金（约万分之 2.5）+ 过户费

### 常见指数

- **上证综合指数（000001）**：反映上交所整体表现，大家说的"大盘"通常指它
- **深证成指（399001）**：深交所的代表性指数
- **沪深300（000300）**：沪深两市最大的 300 家公司，代表大盘蓝筹
- **创业板指（399006）**：深交所创业板的 100 家代表公司`,
  },
  {
    id: 'open-account',
    title: '3. 如何开户',
    content: `## 开户流程

炒股需要一个**证券账户**。现在开户已经完全线上化，整个过程大约 10 分钟。

### 选择券商

选择券商主要看三点：
1. **佣金费率**：目前行业普遍万分之 2.5 左右，有些互联网券商可以到万分之 1.5
2. **APP 好用程度**：界面是否清晰、功能是否完善
3. **是否正规**：必须有证监会颁发的证券业务许可证

常见的券商：中信证券、华泰证券（涨乐财富通）、国泰君安、东方财富证券、同花顺等。

### 开户步骤

1. 下载券商 APP
2. 手机号注册，上传身份证正反面
3. 视频见证（和客服视频确认是本人，约 1-2 分钟）
4. 绑定银行卡（用于转入转出资金）
5. 设置交易密码和资金密码
6. 完成风险测评问卷

### 需要准备

- 本人二代身份证
- 本人银行借记卡
- 能视频通话的手机

### 重要提醒

- 开户**免费**，没有年费
- 只有交易时才产生费用
- 不满 18 岁不能开户
- 一个人最多开 3 个证券账户`,
  },
  {
    id: 'basic-terms',
    title: '4. 基础术语',
    content: `## 股市常用术语

### 价格相关

| 术语 | 含义 |
|------|------|
| 开盘价 | 每天第一笔成交价格 |
| 收盘价 | 每天最后一笔成交价格 |
| 最高价 | 当天最高成交价格 |
| 最低价 | 当天最低成交价格 |
| 涨停 | 涨到当天允许的最大涨幅，不能继续涨了 |
| 跌停 | 跌到当天允许的最大跌幅，不能继续跌了 |

### 交易相关

| 术语 | 含义 |
|------|------|
| 成交量 | 当天成交的股票数量（单位：手） |
| 成交额 | 当天成交的总金额（单位：元） |
| 换手率 | 当天成交量 ÷ 总股本，反映交易活跃度 |
| 买单/卖单 | 想买/想卖的挂单 |

### 估值指标

| 术语 | 公式 | 含义 |
|------|------|------|
| PE（市盈率）| 股价 ÷ 每股收益 | 多少年能回本。PE=10 表示 10 年回本 |
| PB（市净率）| 股价 ÷ 每股净资产 | 股价相对于公司净资产的倍数 |
| ROE | 净利润 ÷ 净资产 | 公司用股东的钱赚钱的能力 |

### 其他重要概念

- **牛市**：股价长期上涨的市场（多头市场）
- **熊市**：股价长期下跌的市场（空头市场）
- **仓位**：你投入股市的资金占总资金的比例（半仓=50%资金在股市）
- **满仓**：所有资金都买了股票
- **空仓**：持有现金，没有买任何股票`,
  },
  {
    id: 'how-to-read',
    title: '5. 如何看盘',
    content: `## 看盘入门

### 分时图

分时图显示的是**一天之内**股价的变化。两条线：
- **白线**：实时成交价格
- **黄线**：当日成交均价的连线

白线在黄线上方 → 走势偏强；白线在黄线下方 → 走势偏弱。

### K 线图（蜡烛图）

K 线图是最重要的技术分析工具。每根 K 线代表一个时间段（日 K = 一天，周 K = 一周）。

**一根 K 线的构成：**
- **实体**（胖的部分）：开盘价和收盘价之间的区间
  - 红色（阳线）：收盘价 > 开盘价，当天涨了
  - 绿色（阴线）：收盘价 < 开盘价，当天跌了
- **影线**（细的部分）：
  - 上影线：最高价
  - 下影线：最低价

### 均线（移动平均线）

| 均线 | 含义 | 用途 |
|------|------|------|
| MA5 | 5 日均线 | 短线趋势 |
| MA10 | 10 日均线 | 短线支撑/压力 |
| MA20 | 20 日均线 | 中期趋势（约一个月） |
| MA60 | 60 日均线 | 中期趋势（约一个季度） |
| MA250 | 年线 | 长期牛熊分界 |

> **金叉**：短期均线从下方上穿长期均线 → 看涨信号
> **死叉**：短期均线从上方下穿长期均线 → 看跌信号

### 成交量

成交量是验证趋势的重要指标：
- 价涨量增 → 上涨有力度，趋势健康
- 价涨量缩 → 上涨乏力，可能见顶
- 价跌量增 → 抛售压力大，趋势不乐观
- 价跌量缩 → 下跌动力减弱，可能见底`,
  },
  {
    id: 'how-to-trade',
    title: '6. 交易实操',
    content: `## 如何买入和卖出

### 买入操作

1. 打开券商 APP，搜索你想买的股票（代码或名称）
2. 进入股票详情页，点击「买入」
3. 输入买入价格（可以选择「市价」或「限价」）
   - **限价单**：指定一个价格，只有到那个价格或更低才成交
   - **市价单**：按当前最优价格立即成交
4. 输入买入数量（100 的整数倍）
5. 确认订单，输入交易密码
6. 等待成交 → 可以在「持仓」中查看

### 卖出操作

与买入类似，但注意：
- 你只能卖你**已经持有**的股票
- 今天买的股票明天才能卖（T+1）
- 卖出时收取 0.05% 印花税

### 实操建议

1. **先模拟，再实战**：大部分券商 APP 有模拟交易功能，先用虚拟资金练习
2. **从小资金开始**：不要一上来就投入全部积蓄，先用几千块感受市场
3. **做好记录**：记录每一笔交易的理由，之后复盘
4. **不要频繁交易**：每次交易都有手续费，频繁进出成本很高
5. **分批操作**：不要一次性全仓买入，可以先买 1/3，后续根据情况加仓或减仓`,
  },
  {
    id: 'risk-control',
    title: '7. 风险控制',
    content: `## 保住本金是第一原则

### 为什么风险控制最重要？

股市中亏损 50%，需要赚 100% 才能回本。简单算一笔账：

> 本金 10 万 → 亏 50% → 剩 5 万
> 5 万要变回 10 万 → 需要涨 100%

**亏损越大，回本越难。** 所以控制亏损比追求收益更重要。

### 止损策略

止损就是提前设定一个亏损上限，到此价格就卖出离场。

| 止损方式 | 做法 | 适用场景 |
|----------|------|----------|
| 固定比例止损 | 亏 5%/8%/10% 就卖 | 新手首选，简单明确 |
| 支撑位止损 | 跌破重要支撑位就卖 | 有一定技术分析基础 |
| 时间止损 | 持有 N 天不涨就卖 | 短线交易 |

### 仓位管理

**永远不要满仓一只股票。** 这是最基本原则。

- 单只股票仓位不超过总资金的 20%-30%
- 始终保持一定现金（至少 10%-20%）
- 行业分散：不要把所有钱都买同一个行业的股票

### 投资纪律

1. **不借钱炒股** — 用自己的闲钱，亏了不影响生活
2. **不跟风买股** — 别人推荐的股票自己要做功课
3. **不追涨杀跌** — 涨了很多再去追、跌了很多就恐慌卖出，最容易亏钱
4. **不在情绪激动时操作** — 恐惧和贪婪是投资者最大的敌人
5. **持续学习** — 多读书、多思考，形成自己的判断力

### 推荐书单

- 《聪明的投资者》— 本杰明·格雷厄姆（巴菲特的老师）
- 《漫步华尔街》— 伯顿·马尔基尔
- 《投资中最简单的事》— 邱国鹭（A 股视角）`,
  },
];

export default function BeginnerGuide() {
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id);

  const current = CHAPTERS.find((c) => c.id === activeChapter)!;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          炒股入门教程
        </h1>
        <p className="text-gray-500">7 个章节，从零开始学炒股</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — chapter nav */}
        <nav className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            {CHAPTERS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(ch.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  activeChapter === ch.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {ch.title}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile chapter selector */}
        <div className="lg:hidden w-full mb-6">
          <select
            value={activeChapter}
            onChange={(e) => setActiveChapter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CHAPTERS.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="card">
            <div
              className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-table:text-sm prose-th:font-medium prose-th:text-gray-700 prose-td:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-800"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(current.content) }}
            />
          </div>

          {/* Chapter navigation buttons */}
          <div className="flex justify-between mt-6">
            {CHAPTERS.findIndex((c) => c.id === activeChapter) > 0 ? (
              <button
                onClick={() => {
                  const idx = CHAPTERS.findIndex((c) => c.id === activeChapter);
                  setActiveChapter(CHAPTERS[idx - 1].id);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ← 上一章
              </button>
            ) : (
              <div />
            )}
            {CHAPTERS.findIndex((c) => c.id === activeChapter) < CHAPTERS.length - 1 ? (
              <button
                onClick={() => {
                  const idx = CHAPTERS.findIndex((c) => c.id === activeChapter);
                  setActiveChapter(CHAPTERS[idx + 1].id);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                下一章 →
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Simple markdown-ish renderer: headings, tables, paragraphs, bold, lists */
function renderMarkdown(md: string): string {
  let html = md
    // headings
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-800 mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // horizontal rules for table rows
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split('|').map((c: string) => c.trim());
      const tag = row.includes('---') ? 'th' : 'td';
      return `<tr>${cells.map((c: string) => `<${tag} class="px-4 py-2 border-b border-gray-100">${c}</${tag}>`).join('')}</tr>`;
    })
    // wrap consecutive <tr>s in <table>
    .replace(/(<tr>[\s\S]*?<\/tr>\s*)+/g, (match) => {
      const headerHtml = match.replace(/<tr>[\s\S]*?<\/tr>/g, (tr: string) => {
        if (tr.includes('<th>')) return `<thead>${tr}</thead>`;
        return tr;
      });
      const bodyRows = headerHtml.replace(/<thead>[\s\S]*?<\/thead>/g, '');
      const thead = headerHtml.match(/<thead>[\s\S]*?<\/thead>/);
      return `<table class="w-full my-4 border-collapse text-sm"><thead>${thead ? thead[0] : ''}</thead><tbody>${bodyRows}</tbody></table>`;
    })
    // paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="text-gray-600 leading-relaxed mb-4">')
    // single newlines to <br> within paragraphs
    .replace(/\n/g, '<br>')
    // blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-300 pl-4 py-2 my-4 bg-blue-50 rounded-r-lg text-gray-700 text-sm">$1</blockquote>');

  html = '<p class="text-gray-600 leading-relaxed mb-4">' + html + '</p>';
  return html;
}
