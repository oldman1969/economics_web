// AI 学习内容清单 —— vendor 自 know_ai 仓库（https://github.com/oldman1969/know_ai）
// 文章清单由 glob 扫描到的 .md 文件自动派生，标题/摘要优先取 overrides.ts 的精修覆盖。
// 内容以原始 .md / .m 字符串通过 Vite `?raw` 打包，与源仓库保持同构，便于日后同步。
import { ARTICLE_OVERRIDES } from './overrides';

export type AiCategory = 'notes' | 'deep-dives' | 'agent' | 'references';

export interface AiArticle {
  id: string;
  category: AiCategory;
  /** deep-dives 的分组，其余分类为 undefined */
  group?: string;
  title: string;
  summary: string;
  /** glob 结果的相对 key，如 './deep-dives/05-Transformer架构.md' */
  file: string;
}

export interface AiCodeFile {
  id: string;
  title: string;
  desc: string;
  file: string;
  /** 关联的 deep-dive 文章 id */
  related: string;
}

const mdRaw = import.meta.glob('./**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const mRaw = import.meta.glob('./**/*.m', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// ── 文章清单自动派生 ────────────────────────────────────────────────────

/** 目录 → id 前缀（references 无数字前缀，单独映射） */
const CATEGORY_ID_PREFIX: Record<string, string> = {
  notes: 'note',
  'deep-dives': 'dd',
  agent: 'agent',
};

const REFERENCE_IDS: Record<string, string> = {
  '理解深度学习-Prince导读.md': 'ref-prince',
  '深入理解AIAgent-李博杰导读.md': 'ref-agent',
};

function deriveId(category: string, filename: string): string | null {
  if (category === 'references') return REFERENCE_IDS[filename] ?? null;
  const prefix = CATEGORY_ID_PREFIX[category];
  const m = filename.match(/^(\d{2})-/);
  return prefix && m ? `${prefix}-${m[1]}` : null;
}

function deriveGroup(category: string, filename: string): string | undefined {
  if (category !== 'deep-dives') return undefined;
  const m = filename.match(/^(\d{2})-/);
  if (!m) return undefined;
  return parseInt(m[1], 10) <= 10 ? '主线技术' : '补充章节';
}

/** 从首行 `# 标题` 提取标题 */
function extractTitle(content: string): string {
  const m = content.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '';
}

/** 取正文首个实质性段落作为摘要（跳过标题/引用/列表/表格/代码块） */
function extractSummary(content: string): string {
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (/^#/.test(line)) continue;
    if (/^>/.test(line)) continue;
    if (/^[-*]/.test(line)) continue;
    if (/^\d+\./.test(line)) continue;
    if (/^\|/.test(line)) continue;
    if (/^```/.test(line)) continue;
    const plain = line.replace(/\*\*/g, '').replace(/`/g, '').replace(/[[\]]/g, '').trim();
    if (plain.length >= 12) {
      return plain.length > 64 ? `${plain.slice(0, 64)}…` : plain;
    }
  }
  return '';
}

function buildArticles(): AiArticle[] {
  const articles: AiArticle[] = [];
  for (const file of Object.keys(mdRaw).sort()) {
    const parts = file.split('/'); // ['./notes/01-智能的起点.md']
    const category = parts[1];
    const filename = parts[parts.length - 1];
    const id = deriveId(category, filename);
    if (!id) continue;
    const content = mdRaw[file];
    const override = ARTICLE_OVERRIDES[filename] ?? {};
    articles.push({
      id,
      category: category as AiCategory,
      group: deriveGroup(category, filename),
      title: override.title ?? extractTitle(content),
      summary: override.summary ?? extractSummary(content),
      file,
    });
  }
  return articles;
}

const ARTICLES: AiArticle[] = buildArticles();

// ── MATLAB 代码清单（显式，title/desc/related 人工精选、低频变动）──────

const CODE_FILES: AiCodeFile[] = [
  { id: 'code-01-cnn', title: 'CNN 卷积前向演示', desc: '卷积→ReLU→池化前向，手算可验证。', file: './code/01-cnn/cnn_quick_demo.m', related: 'dd-01' },
  { id: 'code-02-lstm-verify', title: 'LSTM 手算验证（3 时刻）', desc: '3 时刻前向，验证手算结果。', file: './code/02-lstm/lstm_verify_handcalc.m', related: 'dd-02' },
  { id: 'code-02-lstm-forward', title: 'LSTM 单步前向', desc: '拆开看 LSTM 一个时刻的前向计算。', file: './code/02-lstm/lstm_step_forward.m', related: 'dd-02' },
  { id: 'code-02-lstm-backward', title: 'LSTM 单步反向', desc: '拆开看 LSTM 一个时刻的反向传播。', file: './code/02-lstm/lstm_step_backward.m', related: 'dd-02' },
  { id: 'code-03-backprop', title: '反向传播（两层网络）', desc: '两层网络前向+反向，数值梯度校验。', file: './code/03-backprop/backprop_two_layer.m', related: 'dd-03' },
  { id: 'code-04-attention', title: 'Bahdanau 注意力', desc: 'Bahdanau 注意力 + 点积对比。', file: './code/04-attention/attention_bahdanau.m', related: 'dd-04' },
  { id: 'code-05-transformer', title: '单层 Transformer', desc: '单层 Self-Attention + FFN。', file: './code/05-transformer/transformer_single_layer.m', related: 'dd-05' },
  { id: 'code-06-scaling', title: 'Scaling Laws 模拟', desc: '幂律 + Chinchilla 最优分配。', file: './code/06-scaling/scaling_laws_sim.m', related: 'dd-06' },
  { id: 'code-07-rlhf', title: 'RLHF 简化仿真', desc: '奖励模型 + PPO + KL 简化。', file: './code/07-rlhf/rlhf_simple.m', related: 'dd-07' },
  { id: 'code-08-flashattention', title: 'FlashAttention tiling', desc: 'tiling + online softmax，精确等价验证。', file: './code/08-flashattention/flash_attention_tiling.m', related: 'dd-08' },
  { id: 'code-09-rope', title: 'RoPE 演示', desc: 'RoPE 旋转 + 外推崩溃 + PI 插值。', file: './code/09-rope/rope_demo.m', related: 'dd-09' },
  { id: 'code-10-react', title: 'ReAct Agent 循环', desc: 'Thought→Action→Observation 循环。', file: './code/10-react/react_agent_sim.m', related: 'dd-10' },
];

export interface AiArticleWithContent extends AiArticle {
  content: string;
}

export interface AiCodeFileWithCode extends AiCodeFile {
  code: string;
}

export function getArticle(id: string): AiArticleWithContent | undefined {
  const meta = ARTICLES.find((a) => a.id === id);
  if (!meta) return undefined;
  const content = mdRaw[meta.file];
  if (content == null) return undefined;
  return { ...meta, content };
}

export function getCodeFile(id: string): AiCodeFileWithCode | undefined {
  const meta = CODE_FILES.find((c) => c.id === id);
  if (!meta) return undefined;
  const code = mRaw[meta.file];
  if (code == null) return undefined;
  return { ...meta, code };
}

export function getArticlesByCategory(cat: AiCategory): AiArticle[] {
  return ARTICLES.filter((a) => a.category === cat);
}

export const ALL_CODE_FILES: AiCodeFile[] = CODE_FILES;

export interface AiCategoryMeta {
  label: string;
  title: string;
  subtitle: string;
  path: string;
}

export const CATEGORY_META: Record<AiCategory, AiCategoryMeta> = {
  notes: {
    label: '历史脉络',
    title: 'AI 技术史',
    subtitle: '按时间顺序讲透 AI 背后的技术，理解每个热点的来龙去脉',
    path: '/ai/notes',
  },
  'deep-dives': {
    label: '技术解剖',
    title: 'AI 深层技术解剖',
    subtitle: '不只认识名字，吃透数学、手算验证、代码跑通',
    path: '/ai/deep-dives',
  },
  agent: {
    label: 'Agent 工程',
    title: '深入理解 AI Agent',
    subtitle: '李博杰《深入理解 AI Agent》10 章研读笔记',
    path: '/ai/agent',
  },
  references: {
    label: '参考资料',
    title: '参考教材导读',
    subtitle: 'Prince《理解深度学习》与李博杰《深入理解 AI Agent》导读',
    path: '/ai/references',
  },
};

/** 文件名（basename）→ 文章 id，供 markdown 内跨文档链接（如 `[注意力机制](04-注意力机制.md)`）解析 */
export const FILENAME_TO_ID: Map<string, string> = new Map(
  ARTICLES.map((a) => [a.file.split('/').pop() ?? '', a.id]),
);
