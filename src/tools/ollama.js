import ollama from 'ollama';  // Библиотека для работы с сервисом Ollama

/**
 * Возвращает результата обработки отправленного контекста нейронкой
 * @param messages
 * @returns {Promise<string>}
 */
export async function ollamaProcess(messages = []) {
  const response = await ollama.chat({
    model: 'qwen2.5:7b',
    messages,
  });
  return response.message.content;
}