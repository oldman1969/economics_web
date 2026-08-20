import { useState } from 'react';
import type { AiConfig, ChatMessage, StockInfo, KlineData } from '@/types';
import { fetchStockInfo, fetchKline, searchStocks } from '@/services/stockApi';
import { chat, fetchModels, testConnection } from '@/services/aiService';
import { useAiConfig } from '@/hooks/useAiConfig';
import {
  macd, kdj, ma, boll, latestRsi, latestWr,
  isMacdGoldenCross, isBullsAlignment,
} from '@/utils/indicators';
import {
  Settings, Search, Send, Sparkles, MessageSquare, Stethoscope, Loader2, X,
} from 'lucide-react';

const SYSTEM_PROMPT = '你是一位专业的 A 股投资分析助手，客观、专业、不夸大，回答结尾声明"以上分析仅供参考，不构成投资建议"。';

function buildDiagnosisPrompt(stockInfo: StockInfo, klines: KlineData[]): ChatMessage[] {
  const closes = klines.map((k) => k.close);
  const { dif, dea } = macd(closes);
  const { k, d } = kdj(klines);
  const rsiVal = latestRsi(closes);
  const wrVal = latestWr(klines);
  const { mid, upper, lower } = boll(closes);
  const ma5 = ma(closes, 5);
  const ma10 = ma(closes, 10);
  const ma20 = ma(closes, 20);
  const ma60 = ma(closes, 60);
  const last = closes.length - 1;
  const recent = closes.slice(-5).map((c) => c.toFixed(2)).join('、');

  const userContent = `请分析A股股票 ${stockInfo.name}（${stockInfo.code}）：

【行情数据】
现价 ${stockInfo.price.toFixed(2)}，涨跌幅 ${stockInfo.changePercent.toFixed(2)}%，今开 ${stockInfo.open.toFixed(2)}，昨收 ${stockInfo.preClose.toFixed(2)}，最高 ${stockInfo.high.toFixed(2)}，最低 ${stockInfo.low.toFixed(2)}，成交量 ${stockInfo.volume} 手，成交额 ${(stockInfo.amount / 1e8).toFixed(2)} 亿。

【技术指标】
MACD：DIF=${dif[last]?.toFixed(3)}，DEA=${dea[last]?.toFixed(3)}，当前${isMacdGoldenCross(dif, dea) ? '金叉' : '未金叉'}；
KDJ：K=${k[last]?.toFixed(2)}，D=${d[last]?.toFixed(2)}；
RSI(14)=${rsiVal?.toFixed(1)}，WR(14)=${wrVal?.toFixed(1)}；
均线：MA5=${ma5[last]?.toFixed(2)}，MA10=${ma10[last]?.toFixed(2)}，MA20=${ma20[last]?.toFixed(2)}，MA60=${ma60[last]?.toFixed(2)}，多头排列=${isBullsAlignment(closes) ? '是' : '否'}；
BOLL：上轨=${upper[last]?.toFixed(2)}，中轨=${mid[last]?.toFixed(2)}，下轨=${lower[last]?.toFixed(2)}。

【近5日收盘价】${recent}

请从技术面趋势、支撑压力位、买卖点、风险提示几个维度给出客观分析，控制在 400 字以内。`;

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^###\s+(.+)$/gm, '<h3 class="text-base font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-5 mb-2">$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 mt-5 mb-2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
    .replace(/^[-*]\s+(.+)$/gm, '<div class="flex gap-2 text-gray-600"><span class="text-gray-400 flex-shrink-0">•</span><span>$1</span></div>')
    .replace(/\n/g, '<br>');
}

export default function StockAdvice() {
  const { config, saveConfig } = useAiConfig();
  const [tab, setTab] = useState<'diagnosis' | 'chat'>('diagnosis');
  const [showConfig, setShowConfig] = useState(false);

  // 诊断状态
  const [diagKeyword, setDiagKeyword] = useState('');
  const [diagResult, setDiagResult] = useState('');
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagError, setDiagError] = useState('');

  // 对话状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  const hasKey = config.apiKey.trim().length > 0;

  const resolveCode = async (input: string): Promise<string | null> => {
    const trimmed = input.trim();
    if (/^\d{6}$/.test(trimmed)) return trimmed;
    const results = await searchStocks(trimmed);
    return results.length > 0 ? results[0].code : null;
  };

  const runDiagnosis = async () => {
    if (!hasKey) {
      setDiagError('请先点击右上角「配置」填入你的 API Key');
      return;
    }
    if (!diagKeyword.trim()) return;
    setDiagLoading(true);
    setDiagError('');
    setDiagResult('');
    try {
      const code = await resolveCode(diagKeyword);
      if (!code) {
        setDiagError('未找到该股票，请输入正确的代码或名称');
        return;
      }
      const [info, klines] = await Promise.all([fetchStockInfo(code), fetchKline(code, 'day', 60)]);
      if (!info) {
        setDiagError('股票行情数据获取失败');
        return;
      }
      const prompt = buildDiagnosisPrompt(info, klines);
      const result = await chat(config, prompt);
      setDiagResult(result);
    } catch (err) {
      setDiagError(err instanceof Error ? err.message : '分析失败，请稍后重试');
    } finally {
      setDiagLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text) return;
    if (!hasKey) {
      setChatError('请先点击右上角「配置」填入你的 API Key');
      return;
    }
    const userMsg: ChatMessage = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setChatInput('');
    setChatLoading(true);
    setChatError('');
    try {
      const result = await chat(config, [{ role: 'system', content: SYSTEM_PROMPT }, ...history]);
      setMessages([...history, { role: 'assistant', content: result }]);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : '回复失败，请稍后重试');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">投资建议 · AI 分析</h1>
          <p className="text-gray-500 mt-1">自带 API Key，用 AI 辅助你分析股票</p>
        </div>
        <button
          onClick={() => setShowConfig(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Settings size={16} />
          配置
        </button>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('diagnosis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'diagnosis' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Stethoscope size={16} />
          个股诊断
        </button>
        <button
          onClick={() => setTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'chat' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <MessageSquare size={16} />
          AI 对话
        </button>
      </div>

      {!hasKey && (
        <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          尚未配置 API Key，点击右上角「配置」填入你的 OpenAI 兼容接口信息（如 DeepSeek）。
        </div>
      )}

      {/* 个股诊断 */}
      {tab === 'diagnosis' && (
        <div>
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={diagKeyword}
                onChange={(e) => setDiagKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runDiagnosis()}
                placeholder="输入股票代码或名称，如 600519 或 贵州茅台"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={runDiagnosis}
              disabled={diagLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              {diagLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {diagLoading ? '分析中…' : '开始分析'}
            </button>
          </div>

          {diagError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {diagError}
            </div>
          )}

          {diagLoading && (
            <div className="card text-center py-16">
              <Loader2 size={28} className="animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-500">AI 正在分析，请稍候…</p>
            </div>
          )}

          {diagResult && !diagLoading && (
            <div className="card">
              <div
                className="prose prose-gray max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(diagResult) }}
              />
              <div className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-400">
                AI 生成内容仅供参考，不构成投资建议。
              </div>
            </div>
          )}

          {!diagResult && !diagLoading && !diagError && (
            <div className="card text-center py-16">
              <Stethoscope size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">输入股票代码，让 AI 结合行情和技术指标为你分析</p>
            </div>
          )}
        </div>
      )}

      {/* AI 对话 */}
      {tab === 'chat' && (
        <div className="card p-0 flex flex-col" style={{ height: 520 }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <MessageSquare size={40} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400">和 AI 聊聊你的投资问题</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                />
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-gray-400 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  思考中…
                </div>
              </div>
            )}
          </div>

          {chatError && (
            <div className="px-4 py-2 text-sm text-red-600">{chatError}</div>
          )}

          <div className="border-t border-gray-100 p-4 flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="输入你的问题，回车发送"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={chatLoading || !chatInput.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 配置弹窗 */}
      {showConfig && (
        <ConfigModal
          config={config}
          onSave={(c) => {
            saveConfig(c);
            setShowConfig(false);
          }}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
}

const AI_PROVIDERS = [
  { name: '深度求索 DeepSeek', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
  { name: '智谱 GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  { name: '阿里 通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  { name: '月之暗面 Kimi', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  { name: '零一万物 Yi', baseUrl: 'https://api.lingyiwanwu.com/v1', model: 'yi-lightning' },
  { name: '百度 文心一言', baseUrl: 'https://qianfan.baidubce.com/v2', model: 'ernie-4.0-8k' },
  { name: '腾讯 混元', baseUrl: 'https://api.hunyuan.cloud.tencent.com/v1', model: 'hunyuan-lite' },
  { name: '稀宇 MiniMax', baseUrl: 'https://api.minimax.chat/v1', model: 'MiniMax-Text-01' },
  { name: '阶跃星辰 StepFun', baseUrl: 'https://api.stepfun.com/v1', model: 'step-1-8k' },
];

function ConfigModal({
  config,
  onSave,
  onClose,
}: {
  config: AiConfig;
  onSave: (c: AiConfig) => void;
  onClose: () => void;
}) {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [model, setModel] = useState(config.model);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [models, setModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [modelsError, setModelsError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const inputCls =
    'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  const handleFetchModels = async () => {
    if (!apiKey.trim()) {
      setModelsError('请先填写 API Key');
      return;
    }
    setFetchingModels(true);
    setModelsError('');
    setModels([]);
    try {
      const list = await fetchModels(baseUrl, apiKey);
      setModels(list);
      if (list.length === 0) setModelsError('未获取到模型列表');
    } catch (err) {
      setModelsError(err instanceof Error ? err.message : '获取模型失败');
    } finally {
      setFetchingModels(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ ok: false, message: '请先填写 API Key' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      await testConnection(baseUrl, apiKey);
      setTestResult({ ok: true, message: '连接成功' });
    } catch (err) {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : '连接失败' });
    } finally {
      setTesting(false);
    }
  };

  const handleProvider = (name: string) => {
    const provider = AI_PROVIDERS.find((p) => p.name === name);
    if (provider) {
      setBaseUrl(provider.baseUrl);
      setModel(provider.model);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">AI 配置</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">快速选择厂商</label>
            <div className="flex flex-wrap gap-1.5">
              {AI_PROVIDERS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleProvider(p.name)}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">接口地址 baseUrl</label>
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.deepseek.com" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">模型 model</label>
            <div className="flex gap-2">
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="deepseek-chat" className={inputCls} />
              <button
                onClick={handleFetchModels}
                disabled={fetchingModels}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {fetchingModels ? <Loader2 size={14} className="animate-spin" /> : null}
                获取模型
              </button>
            </div>
            {modelsError && <p className="text-xs text-red-500 mt-1.5">{modelsError}</p>}
            {models.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {models.map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                      model === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">API Key</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." className={inputCls} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : null}
              连通性测试
            </button>
            {testResult && (
              <span className={`text-xs ${testResult.ok ? 'text-green-600' : 'text-red-600'}`}>
                {testResult.message}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400">
            Key 仅保存在浏览器本地，不会上传到任何服务器。支持 DeepSeek、智谱 GLM、通义千问等 OpenAI 兼容接口。
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            取消
          </button>
          <button
            onClick={() => onSave({ baseUrl: baseUrl.trim(), model: model.trim(), apiKey: apiKey.trim() })}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
