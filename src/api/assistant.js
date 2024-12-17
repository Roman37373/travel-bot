import {ollamaProcess} from '../tools/ollama.js';
import {openaiProcess} from '../tools/vsegpt.js';

export async function assistantProcess(messages = []) {
  return await openaiProcess(messages);
  // return await ollamaProcess(messages);
}