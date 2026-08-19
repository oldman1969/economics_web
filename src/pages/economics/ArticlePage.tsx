import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ECONOMIC_ARTICLES } from '@/utils/economics';
import { renderMarkdown } from '@/utils/markdown';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const article = ECONOMIC_ARTICLES.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">文章不存在</p>
        <Link to="/economics" className="text-blue-600 text-sm">返回经济学</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/economics"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        返回经济学
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{article.title}</h1>
      <p className="text-gray-500 mb-8">{article.summary}</p>

      <div className="card">
        <div
          className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
        />
      </div>

      <div className="mt-8 flex justify-between items-center">
        <Link to="/economics" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
          返回经济学首页
        </Link>
      </div>
    </div>
  );
}
