import {ollamaProcess} from '../tools/ollama.js'; // Модуль для работы Ollama
import {openaiProcess} from '../tools/vsegpt.js'; // Модуль для работы с сервисом vsegpt

/**
 * Возвращает результат обработки отправленного контекста нейронкой, с возможностью выбора сервиса
 * @param service - возможные варианты выбора сервиса
 * @param messages
 * @returns {Promise<string>}
 */
export async function assistantProcess(service, messages = []) {
  switch (service) {
    case 'ollama':
      return await ollamaProcess(messages);
    case 'vsegpt':
      return await openaiProcess(messages);
  }
  throw new Error('Bad service');
}