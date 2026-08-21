import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ArrowRight } from 'lucide-react';
import { getArticlesByCategory, CATEGORY_META } from '@/content/ai';
import type { AiArticle, AiCategory } from '@/content/ai';

/** 分组标题的展示文案（未列出的分组直接用原 group 名） */
const GROUP_HEADINGS: Record<string, string> = {
  '主线技术': '主线技术（对应历史脉络）',
  '补充章节': '补充章节（对应 Prince 教材）',
};

/** 各分类的分组展示顺序（未列出的分组按出现顺序排在后面） */
const GROUP_ORDER: Record<string, string[]> = {
  'deep-dives': ['主线技术', '补充章节'],
  multimodal: ['发展史', '深度解剖'],
};

function ArticleList({ articles }: { articles: AiArticle[] }) {
  return (
    <div className="space-y-3">
      {articles.map((a) => (
        <Link key={a.id} to={`/ai/article/${a.id}`} className="card card-hover no-underline group block">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{a.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{a.summary}</p>
            </div>
            <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-600 flex-shrink-0 mt-1 transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function AiCategoryPage({ category }: { category: AiCategory }) {
  const meta = CATEGORY_META[category];
  const articles = getArticlesByCategory(category);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/ai"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        返回 AI 学习
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{meta.title}</h1>
        <p className="text-gray-500">{meta.subtitle}</p>
      </div>

      {(() => {
        // 按 group 字段分组（保持出现顺序）；无分组则平铺
        const groups: { name: string; items: AiArticle[] }[] = [];
        for (const a of articles) {
          const name = a.group ?? '';
          const bucket = groups.find((g) => g.name === name);
          if (bucket) bucket.items.push(a);
          else groups.push({ name, items: [a] });
        }
        const order = GROUP_ORDER[category];
        if (order) {
          groups.sort((a, b) => {
            const ia = order.indexOf(a.name);
            const ib = order.indexOf(b.name);
            return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib);
          });
        }
        if (groups.length <= 1 && !groups[0]?.name) {
          return <ArticleList articles={articles} />;
        }
        return (
          <>
            {groups.map((g, i) => (
              <div key={g.name || i}>
                {g.name && (
                  <h2 className={`text-xl font-bold text-gray-900 mb-4 ${i > 0 ? 'mt-10' : ''}`}>
                    {GROUP_HEADINGS[g.name] ?? g.name}
                  </h2>
                )}
                <ArticleList articles={g.items} />
              </div>
            ))}
          </>
        );
      })()}
    </div>
  );
}
