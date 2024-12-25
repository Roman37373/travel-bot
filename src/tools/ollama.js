import ollama from 'ollama';  // Библиотека для работы с сервисом Ollama

/**
 * Возвращает результата обработки отправленного контекста нейронкой
 * @param model
 * @param messages
 * @returns {Promise<string>}
 */
export async function ollamaProcess(model, messages = []) {
  switch (model) {
    case 't-lite-q4':
      break;
    default:
      model = 'qwen2.5:7b';
      break
  }
  const response = await ollama.chat({
    model,
    messages,
  });
  return response.message.content;
}