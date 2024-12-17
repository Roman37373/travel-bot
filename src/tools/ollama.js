import ollama from 'ollama';

export async function ollamaProcess(messages = []) {
  const response = await ollama.chat({
    model: 'qwen2.5:7b',
    messages,
  });
  return response.message.content;
}