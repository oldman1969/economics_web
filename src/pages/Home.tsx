import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          经济与投资学习平台
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          从理解经济运行规律开始，逐步掌握股票投资的技能。
          零基础也能学会，让知识为你创造财富。
        </p>
      </div>

      {/* Two cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Economics card */}
        <Link
          to="/economics/economic-machine"
          className="card card-hover cursor-pointer no-underline group block"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
              <BookOpen className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">经济学</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-3">
                理解世界运行的基本规律。从桥水基金的《经济机器是怎样运行的》开始，建立你的经济学思维框架。
              </p>
              <span className="text-blue-600 text-sm font-medium group-hover:underline">
                开始学习 →
              </span>
            </div>
          </div>
        </Link>

        {/* Investing card */}
        <Link
          to="/investing"
          className="card card-hover cursor-pointer no-underline group block"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
              <TrendingUp className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">投资</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-3">
                面向 A 股市场，从零开始学炒股。入门教程、实时行情、投资建议，陪伴你成为理性的投资者。
              </p>
              <span className="text-purple-600 text-sm font-medium group-hover:underline">
                开始学习 →
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Feature highlights */}
      <div className="mt-20 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-green-600 text-lg">📖</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">零基础友好</h3>
          <p className="text-sm text-gray-500">从最基础的概念讲起，循序渐进</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-orange-600 text-lg">📊</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">实时数据</h3>
          <p className="text-sm text-gray-500">A 股行情即时查询，K 线图表可视化</p>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-teal-600 text-lg">🎯</span>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">持续更新</h3>
          <p className="text-sm text-gray-500">更多经济和投资模块持续上线中</p>
        </div>
      </div>
    </div>
  );
}
