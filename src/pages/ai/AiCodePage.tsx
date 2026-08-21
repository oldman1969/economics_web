import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Terminal, Copy, Check, ArrowRight } from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import matlab from 'highlight.js/lib/languages/matlab';
import { ALL_CODE_FILES, getCodeFile, getArticle } from '@/content/ai';

hljs.registerLanguage('matlab', matlab);

function CodeList() {
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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">MATLAB 仿真代码</h1>
        <p className="text-gray-500">
          从 deep-dives 抽出的可独立运行脚本，纯矩阵运算，无需工具箱（R2016b+）
        </p>
      </div>

      <div className="space-y-3">
        {ALL_CODE_FILES.map((c) => (
          <div key={c.id} className="card flex items-center gap-4">
            <div className="w-11 h-11 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Terminal size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{c.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {c.desc} · <span className="font-mono text-xs">{c.file.split('/').pop()}</span>
              </p>
            </div>
            <Link
              to={`/ai/code/${c.id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0 no-underline"
            >
              查看代码
            </Link>
            <Link
              to={`/ai/article/${c.related}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0 no-underline"
            >
              关联文章
              <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodeDetail({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const codeFile = getCodeFile(id);

  if (!codeFile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">代码不存在</p>
        <Link to="/ai/code" className="text-blue-600 text-sm">返回代码列表</Link>
      </div>
    );
  }

  const related = getArticle(codeFile.related);
  const filename = codeFile.file.split('/').pop() ?? '';
  const highlighted = hljs.highlight(codeFile.code, { language: 'matlab' }).value;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codeFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 剪贴板不可用时静默失败 */
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/ai/code"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        返回代码列表
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{codeFile.title}</h1>
        <p className="text-gray-500 mt-1">{codeFile.desc}</p>
        <p className="text-xs text-gray-400 font-mono mt-1">{filename}</p>
      </div>

      <div className="markdown relative">
        <button
          onClick={copy}
          className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          {copied ? '已复制' : '复制'}
        </button>
        <pre>
          <code className="hljs language-matlab" dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>

      {related && (
        <div className="mt-6">
          <Link
            to={`/ai/article/${codeFile.related}`}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            阅读对应解剖：{related.title}
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function AiCodePage() {
  const { id } = useParams<{ id: string }>();
  return id ? <CodeDetail id={id} /> : <CodeList />;
}
