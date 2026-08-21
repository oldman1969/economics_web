import { Link } from 'react-router-dom';
import { History, Braces, Bot, BookMarked, Terminal, ArrowRight, Images } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AiCategory } from '@/content/ai';

interface EntryCard {
  key: AiCategory;
  icon: LucideIcon;
  title: string;
  desc: string;
  to: string;
  border: string;
  iconBg: string;
  text: string;
}

const ENTRY_CARDS: EntryCard[] = [
  {
    key: 'notes',
    icon: History,
    title: '历史脉络',
    desc: '8 课 AI 技术史，理解每个技术「为什么出现」',
    to: '/ai/notes',
    border: 'border-indigo-200 bg-indigo-50/60 hover:border-indigo-300',
    iconBg: 'bg-indigo-100 text-indigo-600',
    text: 'text-indigo-700',
  },
  {
    key: 'deep-dives',
    icon: Braces,
    title: '技术解剖',
    desc: '21 篇深度解剖，手算 + 代码，真正「会用」',
    to: '/ai/deep-dives',
    border: 'border-teal-200 bg-teal-50/60 hover:border-teal-300',
    iconBg: 'bg-teal-100 text-teal-600',
    text: 'text-teal-700',
  },
  {
    key: 'agent',
    icon: Bot,
    title: 'Agent 工程',
    desc: '《深入理解 AI Agent》10 章研读笔记',
    to: '/ai/agent',
    border: 'border-violet-200 bg-violet-50/60 hover:border-violet-300',
    iconBg: 'bg-violet-100 text-violet-600',
    text: 'text-violet-700',
  },
  {
    key: 'references',
    icon: BookMarked,
    title: '参考资料',
    desc: 'Prince《理解深度学习》等教材导读，数学底座',
    to: '/ai/references',
    border: 'border-amber-200 bg-amber-50/60 hover:border-amber-300',
    iconBg: 'bg-amber-100 text-amber-600',
    text: 'text-amber-700',
  },
  {
    key: 'multimodal',
    icon: Images,
    title: '多模态',
    desc: 'CLIP / LLaVA / ViT / Whisper，AI 如何看图、听声、看视频',
    to: '/ai/multimodal',
    border: 'border-rose-200 bg-rose-50/60 hover:border-rose-300',
    iconBg: 'bg-rose-100 text-rose-600',
    text: 'text-rose-700',
  },
];

const LEARNING_PATH = [
  {
    step: '第一步',
    title: '建立时间线',
    desc: '按顺序读 8 课历史笔记，理解 AI 技术史主线：神经元 → 反向传播 → Transformer → 大模型 → Agent',
    to: '/ai/notes',
  },
  {
    step: '第二步',
    title: '吃透技术',
    desc: '遇到关键技术跳到对应 deep-dive，手算一个例子 + 跑通一段 MATLAB 才算过关',
    to: '/ai/deep-dives',
  },
  {
    step: '第三步',
    title: '数学严谨',
    desc: '用 Prince《理解深度学习》补数学底座，严格推导，站得住脚',
    to: '/ai/references',
  },
  {
    step: '第四步',
    title: '工程落地',
    desc: '进入 Agent 工程深水区：上下文工程、工具设计、评估方法论',
    to: '/ai/agent',
  },
];

export default function AiHome() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">认识 AI</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          知其然，更要知其所以然 —— 从底层原理到工程实践，
          吃透 AI 背后的技术，而非追逐热点。
        </p>
      </div>

      {/* 分类入口 */}
      <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto mb-14">
        {ENTRY_CARDS.map((c) => (
          <Link
            key={c.key}
            to={c.to}
            className={`block border-2 rounded-2xl px-5 py-4 no-underline transition-all hover:-translate-y-0.5 hover:shadow-md ${c.border}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
                <c.icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-medium ${c.text}`}>{c.title}</span>
                <p className="text-sm text-gray-500 mt-0.5">{c.desc}</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {/* MATLAB 代码入口 */}
      <div className="max-w-4xl mx-auto mb-14">
        <Link to="/ai/code" className="card card-hover no-underline group flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Terminal size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">MATLAB 仿真代码</h2>
            <p className="text-sm text-gray-500">12 段可独立运行的手算仿真脚本，纯矩阵运算，无需工具箱</p>
          </div>
          <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
        </Link>
      </div>

      {/* 推荐学习路径 */}
      <h2 className="text-center text-xl font-bold text-gray-900 mb-6">推荐学习路径</h2>
      <div className="max-w-2xl mx-auto space-y-3">
        {LEARNING_PATH.map((p) => (
          <Link key={p.step} to={p.to} className="card card-hover no-underline group block">
            <div className="flex items-start gap-4">
              <span className="text-sm font-semibold text-gray-400 flex-shrink-0 pt-0.5">{p.step}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{p.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{p.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 一句话主线 */}
      <div className="max-w-2xl mx-auto mt-12 p-5 bg-gray-50 border border-gray-200 rounded-xl">
        <p className="text-sm text-gray-600 leading-relaxed">
          <span className="font-semibold text-gray-900">贯穿全项目的一条金线</span>（Sutton 的「苦涩的教训」）：
          通用方法 + 更多计算，永远胜过人工巧思。
          <br />
          而李博杰《深入理解 AI Agent》给它补了下半句：
          <span className="font-semibold text-gray-900">当模型收敛，竞争力在模型之外——Harness 工程</span>。
        </p>
      </div>
    </div>
  );
}
