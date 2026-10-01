import * as z from 'zod/v4';
import { FACT_ICON_NAMES } from './icons';

export const EntrySchema = z.object({
  name: z.string().describe('Specific name of the thing, e.g. "Parthenon" or "Monstera Deliciosa". Max 4 words.'),
  category: z.string().describe('Short type label, e.g. "Ancient Temple", "Houseplant". Max 3 words.'),
  tagline: z.string().describe('Punchy one-liner, max 8 words.'),
  summary: z.string().describe('What it is in plain words a 12 year old gets. Max 2 short sentences, max 30 words.'),
  confidence: z.number().describe('0-100, how sure you are about the identification.'),
  quickFacts: z
    .array(
      z.object({
        icon: z.enum(FACT_ICON_NAMES).describe('The icon that best fits this fact.'),
        label: z.string().describe('1-3 words, e.g. "Built", "Height", "Lifespan".'),
        value: z.string().describe('Very short value, max 4 words, e.g. "447 BC", "13.7 m".'),
      }),
    )
    .describe('Exactly 4 or 6 key facts most people would want to know at a glance.'),
  stats: z
    .array(
      z.object({
        label: z.string().describe('1-2 words, e.g. "Fame", "Rarity", "Age", "Size".'),
        value: z.number().describe('0-100 score.'),
      }),
    )
    .describe('Exactly 4 playful Pokedex-style stats.'),
  funFacts: z
    .array(z.string().describe('A surprising fact, max 20 words.'))
    .describe('Exactly 3 surprising fun facts.'),
  timeline: z
    .array(
      z.object({
        year: z.string().describe('Year or short date, e.g. "447 BC".'),
        event: z.string().describe('What happened, max 8 words.'),
      }),
    )
    .describe('3-5 key moments in chronological order. Empty array if it has no meaningful history.'),
  quiz: z.object({
    question: z.string().describe('A fun question about it, max 14 words.'),
    options: z.array(z.string().describe('Max 5 words.')).describe('Exactly 3 answer options.'),
    answerIndex: z.number().describe('0-based index of the correct option.'),
    explanation: z.string().describe('Why that is right, max 15 words.'),
  }),
});

export type Entry = z.infer<typeof EntrySchema>;
