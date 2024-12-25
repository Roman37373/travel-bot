import OpenAI from 'openai';  // Библиотека для работы с сервисом OpenAI
import {VSEGPT_TOKEN} from '../config.js';


// Конфигурация для сервиса
const openaiConfig = {
  baseURL: 'https://api.vsegpt.ru/v1/',
  apiKey: VSEGPT_TOKEN,
};

// Сконфигурированный результат библиотеки
export const openai = new OpenAI(openaiConfig);


/**
 * Возвращает результата обработки отправленного контекста нейронкой
 * @param model - llm model
 * @param messages - контекст
 * @returns {Promise<string>} - ответ на контекст
 */
export async function openaiProcess(model, messages = []) {
  switch (model) {
    default:
      model = 'openai/gpt-4o-mini';
  }
  const completion = await openai.chat.completions.create({
    messages,
    model,
    max_tokens: 1024,
  });
  return completion.choices[0].message.content;
}
