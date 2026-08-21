import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import matlab from 'highlight.js/lib/languages/matlab';
import python from 'highlight.js/lib/languages/python';
import xml from 'highlight.js/lib/languages/xml';
import type { Components } from 'react-markdown';
import { FILENAME_TO_ID } from '@/content/ai';

/** 把 markdown 内相对 `.md` 链接解析成站内文章路由；解析不到返回 null */
function resolveMdLink(href: string): string | null {
  if (!href.endsWith('.md')) return null;
  const raw = href.split('/').pop() ?? '';
  let base = raw;
  try {
    base = decodeURIComponent(raw); // 处理文件名空格被编码为 %20 的情况
  } catch {
    base = raw;
  }
  const id = FILENAME_TO_ID.get(base);
  return id ? `/ai/article/${id}` : null;
}

const components: Components = {
  a({ href, children }) {
    if (!href) return <span>{children}</span>;
    // 页内锚点（目录跳转）保持默认
    if (href.startsWith('#')) return <a href={href}>{children}</a>;
    const internal = resolveMdLink(href);
    if (internal) return <Link to={internal}>{children}</Link>;
    // 指向未收录的 md（如 README），降级为纯文本，避免 404
    if (href.endsWith('.md')) return <span>{children}</span>;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="md-table-wrap">
        <table>{children}</table>
      </div>
    );
  },
};

export default function MarkdownView({ content }: { content: string }) {
  return (
    <div className="markdown">
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, [rehypeHighlight, { languages: { matlab, python, xml } }], rehypeSlug]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
}
