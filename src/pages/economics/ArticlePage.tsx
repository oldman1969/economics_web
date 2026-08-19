import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ECONOMIC_ARTICLES } from '@/utils/economics';
import { COMPANY_ARTICLES } from '@/utils/company';
import { MARKET_ARTICLES } from '@/utils/market';
import { SELF_ARTICLES } from '@/utils/self';
import { renderMarkdown } from '@/utils/markdown';

const SOURCES = [
  { articles: ECONOMIC_ARTICLES, backTo: '/economics', backLabel: '返回经济学' },
  { articles: COMPANY_ARTICLES, backTo: '/investing/company-essence', backLabel: '返回公司的本质' },
  { articles: MARKET_ARTICLES, backTo: '/investing/market-essence', backLabel: '返回认识市场' },
  { articles: SELF_ARTICLES, backTo: '/investing/self-essence', backLabel: '返回认识自己' },
];

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const source = SOURCES.find((s) => s.articles.some((a) => a.id === id));
  const article = source?.articles.find((a) => a.id === id);
  const backTo = source?.backTo ?? '/economics';
  const backLabel = source?.backLabel ?? '返回';

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">文章不存在</p>
        <Link to={backTo} className="text-blue-600 text-sm">{backLabel}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        {backLabel}
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{article.title}</h1>
      <p className="text-gray-500 mb-8">{article.summary}</p>

      <div className="card">
        <div
          className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
        />
      </div>

      <div className="mt-8">
        <Link to={backTo} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
          返回列表
        </Link>
      </div>
    </div>
  );
}
