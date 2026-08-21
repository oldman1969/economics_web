import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getArticle, CATEGORY_META } from '@/content/ai';
import Markdown from '@/components/common/Markdown';

export default function AiArticlePage() {
  const { id } = useParams<{ id: string }>();
  const article = id ? getArticle(id) : undefined;

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">文章不存在</p>
        <Link to="/ai" className="text-blue-600 text-sm">返回 AI 学习</Link>
      </div>
    );
  }

  const meta = CATEGORY_META[article.category];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to={meta.path}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        返回{meta.label}
      </Link>

      <Markdown content={article.content} />

      <div className="mt-8">
        <Link to={meta.path} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
          返回列表
        </Link>
      </div>
    </div>
  );
}
