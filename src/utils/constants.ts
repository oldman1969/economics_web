import type { MarketScope } from '@/types';

export const NAV_ITEMS = [
  { label: '首页', path: '/' },
  {
    label: '经济学',
    children: [
      { label: '经济学首页', path: '/economics' },
      { label: '经济机器是怎样运行的', path: '/economics/economic-machine' },
      { label: '信贷与债务', path: '/economics/article/credit-debt' },
      { label: '央行与利率', path: '/economics/article/central-bank' },
      { label: '经济周期', path: '/economics/article/economic-cycle' },
      { label: '通胀与通缩', path: '/economics/article/inflation-deflation' },
      { label: '经济周期与股市', path: '/economics/article/economy-to-stock' },
    ],
  },
  {
    label: '投资',
    children: [
      { label: '投资首页', path: '/investing' },
      { label: '公司的本质', path: '/investing/company-essence' },
      { label: '认识市场', path: '/investing/market-essence' },
      { label: '认识自己', path: '/investing/self-essence' },
      { label: '炒股入门教程', path: '/investing/beginner-guide' },
      { label: '股票实时查询', path: '/investing/stock-query' },
      { label: '智能选股', path: '/investing/stock-screener' },
      { label: '投资建议', path: '/investing/stock-advice' },
    ],
  },
] as const;

export const ECONOMIC_MACHINE_VIDEO_BVID = 'BV1kx41117mE';

export const ECONOMIC_KEY_POINTS = [
  {
    title: '交易 — 经济的最基本单元',
    summary: '每一次交易都是一位买方和一位卖方的交换。经济就是由所有市场中的所有交易构成的。',
    detail: '买方用货币或信用向卖方交换商品、服务或金融资产。理解"交易"是理解整个经济机器的起点。支出总额 = 货币 + 信用，而支出总额是经济的驱动力。',
  },
  {
    title: '信贷 — 经济中最重要的部分',
    summary: '信贷是借贷双方在当下消费未来收入的约定。它让经济有周期，因为我们可以通过借钱来消费超过我们生产的量。',
    detail: '信贷给了我们"提前消费"的能力。当你借钱时，你是在向未来的自己借钱。信贷可以是好事（当它提高生产率时），也可以是坏事（当它过度消费无法偿还时）。债务周期是理解经济波动的关键。',
  },
  {
    title: '短期债务周期（5-8年）',
    summary: '央行通过调节利率来控制信贷的扩张和收缩，形成大约5-8年的短期债务周期。',
    detail: '当通胀过高时，央行提高利率 → 信贷收缩 → 消费减少 → 经济降温。当经济衰退时，央行降低利率 → 信贷扩张 → 消费增加 → 经济复苏。这个周期周而复始，大约每5-8年完成一次。',
  },
  {
    title: '长期债务周期（75-100年）',
    summary: '当债务的增长速度持续超过收入的增长速度时，长期债务周期就形成了。最终债务泡沫破裂，引发去杠杆化。',
    detail: '每个短期周期的底部和顶部都高于前一个周期，因为人们倾向于借更多的钱而不偿还。几十年来，债务逐渐积累，最终债务偿还成本增速超过收入增速。当央行无法再通过降息来刺激经济时（利率已接近0），长期债务周期的顶部就到了。',
  },
  {
    title: '去杠杆化 — 最危险的时刻',
    summary: '去杠杆化是削减债务的过程。有四种方式：削减支出、债务违约重组、财富再分配、印钞。关键是找到"漂亮的去杠杆化"。',
    detail: '四种去杠杆方式：(1) 削减支出 → 通缩萧条；(2) 债务违约/重组 → 资产价格暴跌；(3) 财富再分配 → 社会动荡；(4) 央行印钞 → 通货膨胀。"漂亮的去杠杆化"需要四种方式平衡使用，在降低债务的同时保持经济增长。',
  },
];

export const MARKET_SCOPES: { value: MarketScope; label: string }[] = [
  { value: 'all', label: '全部A股' },
  { value: 'sh-main', label: '沪市主板' },
  { value: 'sz-main', label: '深市主板' },
  { value: 'chinext', label: '创业板' },
  { value: 'star', label: '科创板' },
];
