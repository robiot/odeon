# Odeon

A Pokédex for the real world. Open the app and you're straight in the camera. Snap anything (a building, a plant, an animal, a gadget) and Odeon plays a scan animation while Claude identifies it. You then get a short, interactive entry next to your photo:

- **Hero**: your photo with parallax, an emoji badge, name, category and a one-line tagline
- **At a glance**: 4–6 tappable fact tiles (e.g. *Built: 447 BC*, *Height: 13.7 m*)
- **Stats**: Pokédex-style animated bars (Fame, Rarity, Age…)
- **Did you know?**: swipeable fun-fact cards
- **Timeline**: key moments, when the thing has a history
- **Quick quiz**: one tap-to-answer question with haptics

Claude returns all of this as structured output (JSON validated against a Zod schema in `src/schema.ts`), so every entry has the same layout.

## Run it

```bash
npm install
cp .env.example .env   # then paste your Anthropic API key
npx expo start
```

Open it with **Expo Go** on your phone (scan the QR code). The camera doesn't work in simulators.

## Config

| Variable | |
|---|---|
| `EXPO_PUBLIC_ANTHROPIC_API_KEY` | Your Anthropic API key. |
| `EXPO_PUBLIC_ANTHROPIC_BASE_URL` | Optional. Your own proxy that adds the key on the server. |

> ⚠️ `EXPO_PUBLIC_*` values are bundled into the app, so anyone with the build can pull the key out. That's fine for a personal build. Before you share the app, put a small proxy in front of the API and use `EXPO_PUBLIC_ANTHROPIC_BASE_URL`.

## How it works

| File | |
|---|---|
| `App.tsx` | State machine: camera → scanning → result |
| `src/screens/CameraScreen.tsx` | Full-screen camera with a Pokéball shutter |
| `src/screens/ScanningScreen.tsx` | Scan animation (laser sweep, spinning reticle, blinking feature points, progress, status text) |
| `src/screens/ResultScreen.tsx` | The interactive entry page |
| `src/claude.ts` | Calls `claude-opus-5-5` with the photo and parses the structured output |
| `src/prepareImage.ts` | Shrinks the photo to 1024px so the upload is fast |

The app uses low effort for fast scans and turns on server-side refusal fallbacks (`fallbacks: "default"`).
