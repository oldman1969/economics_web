/** 简易 markdown 渲染：支持标题、加粗、列表、段落、换行 */
export function renderMarkdown(md: string): string {
  return md
    .replace(/^###\s+(.+)$/gm, '<h3 class="text-base font-semibold text-gray-800 mt-6 mb-2">$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-3">$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-3">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
    .replace(/^- (?!\s*-)(.+)$/gm, '<div class="flex gap-2 text-gray-600 my-1"><span class="text-gray-400 flex-shrink-0">•</span><span>$1</span></div>')
    .replace(/\n\n+/g, '<div class="h-3"></div>')
    .replace(/\n/g, '<br>');
}
