import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { SELF_ARTICLES } from '@/utils/self';

export default function SelfHome() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">认识自己</h1>
        <p className="text-gray-500">第四层 · 认识自己 —— 投资即修行</p>
      </div>

      <div className="space-y-4">
        {SELF_ARTICLES.map((a, i) => (
          <Link key={a.id} to={`/investing/self-essence/${a.id}`} className="card card-hover no-underline group block">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
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
