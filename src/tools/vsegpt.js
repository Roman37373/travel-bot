import OpenAI from 'openai';
import {VSEGPT_TOKEN} from '../config.js';

const openaiConfig = {
  baseURL: 'https://api.vsegpt.ru/v1/',
  apiKey: VSEGPT_TOKEN,
};

export const openai = new OpenAI(openaiConfig);

export async function openaiProcess(messages = []) {
  const completion = await openai.chat.completions.create({
    messages,
    max_tokens: 1024,
    model: 'openai/gpt-4o-mini',
  });
  // TODO: Calculate prices and tokens
  return completion.choices[0].message.content;
}
