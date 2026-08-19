import { Link } from 'react-router-dom';
import { Video, FileText, ArrowRight } from 'lucide-react';
import { ECONOMIC_ARTICLES } from '@/utils/economics';

export default function EconomicsHome() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">经济学</h1>
        <p className="text-gray-500">第一层 · 认识经济 —— 理解世界的底层运行规则</p>
      </div>

      <div className="space-y-4">
        {/* 经济机器视频 */}
        <Link to="/economics/economic-machine" className="card card-hover no-underline group block">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Video size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">经济机器是怎样运行的</h2>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex-shrink-0">视频</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Ray Dalio / 桥水基金出品，30 分钟动画讲透交易、信贷、债务周期——理解整个经济机器的起点。
              </p>
            </div>
            <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-600 flex-shrink-0 mt-1 transition-colors" />
          </div>
        </Link>

        {/* 文章列表 */}
        {ECONOMIC_ARTICLES.map((a, i) => (
          <Link key={a.id} to={`/economics/article/${a.id}`} className="card card-hover no-underline group block">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{a.title}</h2>
                  <span className="text-xs text-gray-400 flex-shrink-0">{i + 1}</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{a.summary}</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-600 flex-shrink-0 mt-1 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
