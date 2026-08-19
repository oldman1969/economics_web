import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ECONOMIC_ARTICLES } from '@/utils/economics';
import { COMPANY_ARTICLES } from '@/utils/company';
import { renderMarkdown } from '@/utils/markdown';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const isCompany = COMPANY_ARTICLES.some((a) => a.id === id);
  const articles = isCompany ? COMPANY_ARTICLES : ECONOMIC_ARTICLES;
  const article = articles.find((a) => a.id === id);
  const backTo = isCompany ? '/investing/company-essence' : '/economics';
  const backLabel = isCompany ? '返回公司的本质' : '返回经济学';

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
