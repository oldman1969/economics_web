import { useState, useCallback } from 'react';
import type { AiConfig } from '@/types';

const STORAGE_KEY = 'ai_config';

const DEFAULT_CONFIG: AiConfig = {
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  apiKey: '',
};

function loadConfig(): AiConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...DEFAULT_CONFIG, ...saved };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function useAiConfig() {
  const [config, setConfig] = useState<AiConfig>(loadConfig);

  const saveConfig = useCallback((next: AiConfig) => {
    setConfig(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  return { config, saveConfig };
}
