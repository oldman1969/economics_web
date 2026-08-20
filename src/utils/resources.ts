export interface ResourceItem {
  name: string;
  desc: string;
  author?: string; // 书籍作者
  tag?: string;
  link?: string; // 外部链接
  noteId?: string; // 读书笔记 id
}

export interface ResourceCategory {
  title: string;
  subtitle: string;
  items: ResourceItem[];
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    title: '开源库',
    subtitle: '股票数据、回测、实盘工具',
    items: [
      { name: 'AKShare', desc: 'A股最自由的免费数据入口，行情/财务/资金流/龙虎榜都拉得到', tag: '数据', link: 'https://github.com/akfamily/akshare' },
      { name: 'Tushare Pro', desc: '更稳定，需注册积分（部分收费）', tag: '数据', link: 'https://tushare.pro' },
      { name: 'baostock', desc: '免费、无需注册的A股数据源', tag: '数据', link: 'http://baostock.com' },
      { name: 'Backtrader', desc: '事件驱动回测框架，最适合入门，50行能跑双均线策略', tag: '回测', link: 'https://github.com/mementum/backtrader' },
      { name: 'Qlib', desc: '微软 AI 量化研究框架，内置因子库 + 机器学习模板', tag: '回测/AI', link: 'https://github.com/microsoft/qlib' },
      { name: 'vectorbt', desc: '向量化加速回测，适合大规模参数扫描', tag: '回测', link: 'https://github.com/polakowo/vectorbt' },
      { name: 'vn.py / VeighNa', desc: '国产最成熟实盘框架，支持 CTP/XTP 等 A 股接口', tag: '实盘', link: 'https://github.com/vnpy/vnpy' },
    ],
  },
  {
    title: '长线 · 价值投资',
    subtitle: '从格雷厄姆到巴菲特，再到 A 股实践',
    items: [
      { name: '聪明的投资者', author: '本杰明·格雷厄姆', desc: '价值投资奠基之作，新手入门首选', tag: '经典', noteId: 'intelligent-investor' },
      { name: '证券分析', author: '本杰明·格雷厄姆', desc: '被誉为"投资者的圣经"', tag: '经典', noteId: 'security-analysis' },
      { name: '巴菲特致股东的信', author: '沃伦·巴菲特', desc: '巴菲特投资理念的精髓，每年一封', tag: '经典', noteId: 'buffett-letters' },
      { name: '穷查理宝典', author: '查理·芒格', desc: '多元思维模型，芒格的智慧', tag: '经典', noteId: 'poor-charlies-almanack' },
      { name: '投资中最简单的事', author: '邱国鹭', desc: 'A股价值投资的实操，便宜才是硬道理', tag: 'A股', noteId: 'simplest-thing-investing' },
      { name: '价值', author: '张磊', desc: '高瓴资本，长期主义理念', tag: 'A股', noteId: 'value-zhang-lei' },
      { name: '投资最重要的事', author: '霍华德·马克斯', desc: '讲透风险与周期，第二层思维', tag: '经典', noteId: 'most-important-thing' },
    ],
  },
  {
    title: '短线 · 打板 / 龙头',
    subtitle: '高风险，小仓位学习验证，切勿盲目跟风',
    items: [
      { name: '什么是打板', desc: '先搞懂涨停和打板是什么', tag: '入门', noteId: 'da-ban-basics' },
      { name: '一进二战法', desc: '二板才见真章，首板可能是偶然', tag: '打板', noteId: 'yi-jin-er' },
      { name: '龙头战法', desc: '只做最强的那只，买核心不买杂毛', tag: '龙头', noteId: 'long-tou' },
      { name: '情绪周期', desc: '市场情绪的四阶段，短线的天时', tag: '周期', noteId: 'emotion-cycle' },
      { name: '买在分歧卖在一致', desc: '短线的核心心法，看懂就入门了', tag: '心法', noteId: 'divergence-consensus' },
      { name: '短线风控', desc: '止损、分仓、空仓，活着才有机会', tag: '风控', noteId: 'risk-control' },
    ],
  },
];
