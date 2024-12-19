import path from 'node:path';  // Библиотека для работы с путями
import fs from 'node:fs/promises';  // Библиотека для работы с файловой системой
import {ollamaProcess} from '../tools/ollama.js'; // Модуль для работы Ollama
import {openaiProcess} from '../tools/vsegpt.js'; // Модуль для работы с сервисом vsegpt
import {VSEGPT_TOKEN} from '../config.js';

let systemPrompt = '';

/**
 * Подготавливает к работе ассистента
 * @returns {Promise<void>}
 */
export async function initAssistant() {
  systemPrompt = await fs.readFile(path.join(import.meta.dirname, '../..', 'data', 'prompt.md'), 'utf8');
}

/**
 * Возвращает результат обработки отправленного контекста нейронкой, с возможностью выбора сервиса
 * @param service - возможные варианты выбора сервиса
 * @param messages
 * @returns {Promise<string>}
 */
export async function assistantProcess(service, messages = []) {
  // добавляем промпт в историю сообщений
  const prompt = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...messages,
  ];

  switch (service) {
    case 'vsegpt':
      if (VSEGPT_TOKEN) {
        return await openaiProcess(prompt);
      }
  }
  return await ollamaProcess(prompt);
}