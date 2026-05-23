/**
 * Groq API client — OpenAI-compatible REST interface.
 * Free tier: 14,400 requests/day, no credit card required.
 *
 * Docs: https://console.groq.com/docs/openai
 * Model: llama-3.3-70b-versatile (best free model for chat/coaching)
 */

const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | any[];
}

interface GroqResponse {
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
}

/**
 * One-shot or multi-turn chat completion via Groq.
 */
export async function groqComplete(
  messages: GroqMessage[],
  options?: { model?: string; max_tokens?: number; temperature?: number; response_format?: { type: string } }
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_GROQ_API_KEY is not set.');
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options?.model ?? DEFAULT_MODEL,
      messages,
      max_tokens: options?.max_tokens ?? 256,
      temperature: options?.temperature ?? 0.8,
      ...(options?.response_format ? { response_format: options.response_format } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data: GroqResponse = await res.json();
  return data.choices[0]?.message?.content?.trim() ?? '';
}
