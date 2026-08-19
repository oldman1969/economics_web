import { Link } from 'react-router-dom';
import {
  BookOpen, Building2, LineChart, Heart,
  Search, Filter, Sparkles, ShieldCheck, Compass, TrendingUp, ChevronDown,
} from 'lucide-react';

const LEVELS = [
  {
    level: '第一层',
    title: '认识经济',
    desc: '世界的底层规则：交易、信贷、债务周期',
    note: '从《经济机器是怎样运行的》开始',
    icon: <BookOpen size={22} />,
    card: 'border-blue-200 bg-blue-50/60 hover:border-blue-300',
    iconBg: 'bg-blue-100 text-blue-600',
    text: 'text-blue-700',
    to: '/economics',
  },
  {
    level: '第二层',
    title: '认识公司',
    desc: '股票的本质：所有权、商业模式、财报',
    note: '股票 = 公司所有权凭证，而非彩票',
    icon: <Building2 size={22} />,
    card: 'border-green-200 bg-green-50/60 hover:border-green-300',
    iconBg: 'bg-green-100 text-green-600',
    text: 'text-green-700',
    to: '/investing/company-essence',
  },
  {
    level: '第三层',
    title: '认识市场',
    desc: '价格从哪来：估值、情绪、牛熊周期',
    note: '价格 = 价值 + 情绪',
    icon: <LineChart size={22} />,
    card: 'border-orange-200 bg-orange-50/60 hover:border-orange-300',
    iconBg: 'bg-orange-100 text-orange-600',
    text: 'text-orange-700',
    to: '/investing/market-essence',
  },
  {
    level: '第四层',
    title: '认识自己',
    desc: '投资即修行：风险、仓位、情绪、复利',
    note: '先学会不亏钱，再想赚钱',
    icon: <Heart size={22} />,
    card: 'border-purple-200 bg-purple-50/60 hover:border-purple-300',
    iconBg: 'bg-purple-100 text-purple-600',
    text: 'text-purple-700',
    to: '/investing/self-essence',
  },
];

const TOOLS = [
  { title: '股票查询', desc: '认识「价格」的窗口', icon: <Search size={20} />, color: 'bg-blue-100 text-blue-600', to: '/investing/stock-query' },
  { title: '智能选股', desc: '认识「标准」与条件', icon: <Filter size={20} />, color: 'bg-orange-100 text-orange-600', to: '/investing/stock-screener' },
  { title: 'AI 分析', desc: '认识「多维度判断」', icon: <Sparkles size={20} />, color: 'bg-purple-100 text-purple-600', to: '/investing/stock-advice' },
];

const PRINCIPLES = [
  { title: '敬畏市场', desc: '先学会不亏钱，再想赚钱', icon: <ShieldCheck size={20} />, color: 'bg-blue-100 text-blue-600' },
  { title: '本质认知', desc: '讲透「为什么」，而非「是什么」', icon: <Compass size={20} />, color: 'bg-green-100 text-green-600' },
  { title: '长期主义', desc: '投资是认知的变现，非运气的博弈', icon: <TrendingUp size={20} />, color: 'bg-purple-100 text-purple-600' },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          从本质理解投资
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          四个层次，从经济到公司、从市场到自我，建立正确的投资世界观。
          不教追涨杀跌，只讲透「为什么」。
        </p>
      </div>

      {/* 四层认知路径 */}
      <div className="max-w-2xl mx-auto mb-16">
        {LEVELS.map((lv, i) => (
          <div key={lv.title}>
            <Link
              to={lv.to}
              className={`block border-2 rounded-2xl px-5 py-4 no-underline transition-all hover:-translate-y-0.5 hover:shadow-md ${lv.card}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${lv.iconBg}`}>
                  {lv.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-medium ${lv.text}`}>{lv.level}</span>
                  <h2 className="text-lg font-semibold text-gray-900 leading-tight">{lv.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{lv.desc}</p>
                </div>
                <p className={`hidden sm:block text-sm text-right flex-shrink-0 ${lv.text}`}>{lv.note}</p>
              </div>
            </Link>
            {i < LEVELS.length - 1 && (
              <div className="flex justify-center py-1.5">
                <ChevronDown size={20} className="text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 工具入口 */}
      <h2 className="text-center text-xl font-bold text-gray-900 mb-6">工具 · 辅助认知</h2>
      <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
        {TOOLS.map((t) => (
          <Link key={t.title} to={t.to} className="card card-hover no-underline group block">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${t.color}`}>
              {t.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{t.title}</h3>
            <p className="text-sm text-gray-500">{t.desc}</p>
          </Link>
        ))}
      </div>

      {/* 核心理念 */}
      <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="text-center">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3 ${p.color}`}>
              {p.icon}
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{p.title}</h3>
            <p className="text-sm text-gray-500">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
