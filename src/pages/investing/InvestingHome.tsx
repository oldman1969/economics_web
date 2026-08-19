import { Link } from 'react-router-dom';
import { BookOpen, Search, Filter, Lightbulb, ArrowRight } from 'lucide-react';

export default function InvestingHome() {
  const modules = [
    {
      title: '炒股入门教程',
      desc: '从零开始，手把手教你理解股票市场。什么是股票、怎么开户、如何看盘、怎么交易——7 个章节带你入门。',
      icon: <BookOpen size={24} />,
      color: 'bg-blue-100 text-blue-600',
      to: '/investing/beginner-guide',
      available: true,
    },
    {
      title: '股票实时查询',
      desc: '搜索 A 股任意股票，查看实时行情、K 线图表。支持自选股收藏，随时掌握市场动态。',
      icon: <Search size={24} />,
      color: 'bg-green-100 text-green-600',
      to: '/investing/stock-query',
      available: true,
    },
    {
      title: '智能选股',
      desc: '按基本面、技术面等条件筛选 A 股，支持保存分组一键复用，快速找到符合你标准的股票。',
      icon: <Filter size={24} />,
      color: 'bg-orange-100 text-orange-600',
      to: '/investing/stock-screener',
      available: true,
    },
    {
      title: '投资建议',
      desc: 'AI 智能诊股、基本面分析、技术指标解读——帮你做出更理性的投资决策。',
      icon: <Lightbulb size={24} />,
      color: 'bg-purple-100 text-purple-600',
      to: '/investing/stock-advice',
      available: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          投资 — A 股市场
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          从这里开始你的投资之旅。无论你是完全不懂股票的小白，还是想提升分析能力的老手，都能找到有用的内容。
        </p>
      </div>

      <div className="space-y-5">
        {modules.map((mod) => (
          <div key={mod.to} className="card card-hover">
            {mod.available ? (
              <Link to={mod.to} className="flex items-start gap-5 no-underline group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${mod.color}`}>
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {mod.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{mod.desc}</p>
                </div>
                <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-600 flex-shrink-0 mt-2 transition-colors" />
              </Link>
            ) : (
              <div className="flex items-start gap-5 opacity-60">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${mod.color}`}>
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {mod.title}
                    <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                      即将上线
                    </span>
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{mod.desc}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
