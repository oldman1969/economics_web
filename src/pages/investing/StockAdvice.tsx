import { Lightbulb, Sparkles, TrendingUp, Shield } from 'lucide-react';

const FEATURES = [
  {
    icon: <Sparkles size={24} />,
    title: 'AI 智能诊股',
    desc: '利用 AI 大模型综合分析个股的基本面、技术面、资金面，给出多维度评分和诊断结论。',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: <TrendingUp size={24} />,
    title: '基本面分析',
    desc: '深度解读财报数据：营收、利润、现金流、ROE、PE/PB 估值水平，一眼看清公司质地。',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: <Shield size={24} />,
    title: '技术指标分析',
    desc: 'MACD、KDJ、RSI、布林带等经典指标自动解读，辅助判断买卖时机。',
    color: 'bg-green-100 text-green-600',
  },
];

export default function StockAdvice() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lightbulb size={32} className="text-purple-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          投资建议
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          更智能的投资决策辅助工具，帮你从多个维度分析股票，做出更理性的判断。
        </p>
      </div>

      {/* Coming soon banner */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100 mb-10 text-center py-8">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-3">
          即将上线
        </span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">功能开发中，敬请期待</h2>
        <p className="text-gray-500 text-sm">
          我们正在紧锣密鼓地开发投资建议功能，届时将提供 AI 驱动的智能分析服务。
        </p>
      </div>

      {/* Feature preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">计划中的功能</h3>
        {FEATURES.map((f) => (
          <div key={f.title} className="card card-hover flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
              {f.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{f.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-10 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-800">
          ⚠️ <strong>免责声明</strong>：投资建议功能仅提供参考分析，不构成任何买卖建议。股市有风险，投资需谨慎。请根据自己的实际情况独立做出投资决策。
        </p>
      </div>
    </div>
  );
}
