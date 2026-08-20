import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RESOURCE_CATEGORIES } from '@/utils/resources';
import { ExternalLink, BookOpen } from 'lucide-react';

const TAG_COLOR: Record<string, string> = {
  数据: 'bg-blue-100 text-blue-600',
  回测: 'bg-green-100 text-green-600',
  '回测/AI': 'bg-green-100 text-green-600',
  实盘: 'bg-orange-100 text-orange-600',
  经典: 'bg-purple-100 text-purple-600',
  A股: 'bg-red-100 text-red-600',
  打板: 'bg-orange-100 text-orange-600',
  龙头: 'bg-orange-100 text-orange-600',
  心法: 'bg-red-100 text-red-600',
  风控: 'bg-red-100 text-red-600',
  入门: 'bg-blue-100 text-blue-600',
  周期: 'bg-teal-100 text-teal-600',
};

export default function Resources() {
  const [activeTab, setActiveTab] = useState(0);
  const category = RESOURCE_CATEGORIES[activeTab];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">学习资源</h1>
        <p className="text-gray-500">开源库 + 长线书单 + 短线经验，帮你找到学习路径</p>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-8 justify-center">
        {RESOURCE_CATEGORIES.map((c, i) => (
          <button
            key={c.title}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === i ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      {/* 分类标题 */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
        <p className="text-gray-500 text-sm mt-1">{category.subtitle}</p>
      </div>

      {/* 资源条目 */}
      <div className="space-y-3">
        {category.items.map((item) => (
          <div key={item.name} className="card flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                {item.author && <span className="text-xs text-gray-400">{item.author}</span>}
                {item.tag && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${TAG_COLOR[item.tag] ?? 'bg-gray-100 text-gray-500'}`}>
                    {item.tag}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
            {item.noteId && (
              <Link
                to={`/resources/note/${item.noteId}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0 no-underline"
              >
                <BookOpen size={14} />
                读笔记
              </Link>
            )}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0 no-underline"
              >
                <ExternalLink size={14} />
                访问
              </a>
            )}
          </div>
        ))}
      </div>

      {/* 风险提示 */}
      {activeTab === 2 && (
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            ⚠️ 短线打板、龙头战法属于高风险操作，普通投资者应小仓位学习验证，切勿盲目跟风。
          </p>
        </div>
      )}
    </div>
  );
}
