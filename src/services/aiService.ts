import type { AiConfig, ChatMessage } from '@/types';

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

/** 获取模型列表（OpenAI 兼容 /models 端点） */
export async function fetchModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const res = await fetch(`${normalizeBaseUrl(baseUrl)}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      detail = '';
    }
    throw new Error(`请求失败 (${res.status})${detail ? `：${detail.slice(0, 200)}` : ''}`);
  }
  const data = await res.json();
  const list = data?.data;
  if (!Array.isArray(list)) return [];
  return list
    .map((m: { id?: string }) => m.id)
    .filter((id: string | undefined): id is string => !!id);
}

/** 连通性测试：能拉到模型列表即视为连通 */
export async function testConnection(baseUrl: string, apiKey: string): Promise<void> {
  await fetchModels(baseUrl, apiKey);
}

/** 调用 OpenAI 兼容接口，非流式返回完整内容 */
export async function chat(config: AiConfig, messages: ChatMessage[]): Promise<string> {
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const data = await res.json();
      detail = data?.error?.message || JSON.stringify(data).slice(0, 200);
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new Error(`AI 请求失败 (${res.status})${detail ? `：${detail.slice(0, 200)}` : ''}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI 返回内容为空');
  }
  return content;
}

export interface ChatStreamChunk {
  reasoning: string;
  content: string;
}

/** 调用 OpenAI 兼容接口，流式返回思考过程(reasoning)和答案(content) */
export async function chatStream(
  config: AiConfig,
  messages: ChatMessage[],
  onDelta: (chunk: ChatStreamChunk) => void
): Promise<ChatStreamChunk> {
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const data = await res.json();
      detail = data?.error?.message || JSON.stringify(data).slice(0, 200);
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new Error(`AI 请求失败 (${res.status})${detail ? `：${detail.slice(0, 200)}` : ''}`);
  }

  if (!res.body) {
    throw new Error('AI 流式响应无内容');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let reasoning = '';
  let content = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta;
        const reasoningDelta = delta?.reasoning_content ?? delta?.reasoning ?? delta?.thoughts ?? delta?.thinking;
        if (reasoningDelta) {
          reasoning += reasoningDelta;
        }
        if (delta?.content) {
          content += delta.content;
        }
        onDelta({ reasoning, content });
      } catch {
        // 忽略无法解析的行
      }
    }
  }

  return { reasoning, content };
}
