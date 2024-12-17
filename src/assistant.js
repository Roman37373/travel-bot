import {ollamaProcess} from './ollama.js';

export async function assistantProcess(messages = []) {
  return await ollamaProcess(messages);
}