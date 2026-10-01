import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { EntrySchema, type Entry } from './schema';

const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const baseURL = process.env.EXPO_PUBLIC_ANTHROPIC_BASE_URL || undefined;

// NOTE: An EXPO_PUBLIC_ key is bundled into the app. Fine for a personal build;
// for anything you distribute, point EXPO_PUBLIC_ANTHROPIC_BASE_URL at your own
// proxy that injects the key server-side and leave the key unset here.
const client = new Anthropic({
  apiKey: apiKey ?? 'proxy',
  baseURL,
  dangerouslyAllowBrowser: true,
});

const SYSTEM = `You are Odeon, a Pokedex for the real world. The user points their phone camera at something - a building, landmark, animal, plant, food, gadget, artwork, vehicle, anything - and you identify it and write its Pokedex entry.

Rules:
- Identify the most prominent subject as specifically as you can (the exact landmark, species, model). If you can't be sure, name the most likely candidate and lower confidence.
- If it's an everyday generic object (a mug, a chair), make the entry about that kind of object - its history and surprising facts.
- Write for someone glancing at a phone: tiny, punchy, concrete. Numbers over adjectives. No long sentences, no filler.
- Pick quick facts that matter most for this kind of thing (a building: year built, architect, height, style; an animal: lifespan, diet, top speed, habitat).
- Facts must be true. Prefer well-established facts over obscure claims.
- Plain text only: no emojis, no em dashes or en dashes (use a hyphen for ranges like "447-432 BC"), no exclamation marks.`;

export async function analyzeImage(base64Jpeg: string): Promise<Entry> {
  const response = await client.beta.messages.parse({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: {
      effort: 'low',
      format: betaZodOutputFormat(EntrySchema),
    },
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Jpeg } },
          { type: 'text', text: 'What is this? Write its entry.' },
        ],
      },
    ],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error("Claude couldn't analyze this one. Try another angle or subject.");
  }
  if (!response.parsed_output) {
    throw new Error('Got an unreadable answer. Try scanning again.');
  }
  return response.parsed_output;
}
