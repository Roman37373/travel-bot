import {ollamaProcess} from '../tools/ollama.js'; // Модуль для работы Ollama
import {openaiProcess} from '../tools/vsegpt.js'; // Модуль для работы с сервисом vsegpt
import {VSEGPT_TOKEN} from '../config.js';

/**
 * Возвращает результат обработки отправленного контекста нейронкой, с возможностью выбора сервиса
 * @param service - возможные варианты выбора сервиса
 * @param messages
 * @returns {Promise<string>}
 */
export async function assistantProcess(service, messages = []) {
  switch (service) {
    case 'vsegpt':
      if (VSEGPT_TOKEN) {
        return await openaiProcess(messages);
      }
  }
  return await ollamaProcess(messages);
}