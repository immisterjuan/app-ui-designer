# App UI Designer

This repository contains an initial scaffold for the App UI Designer (React + TypeScript PWA).

What I added in this commit:
- Vite + React + TypeScript scaffold
- vite-plugin-pwa configured for offline shell
- Basic editor skeleton using React Flow
- IndexedDB helpers (idb) for wireframe and kit persistence
- Kit loader, GitHub OAuth & commit helper placeholders, AI key manager placeholders
- Basic app shell and minimal styles

Next steps (recommended):
1. Install dependencies: `npm install` or `pnpm install`
2. Run locally: `npm run dev`
3. Implement OAuth app registration (GitHub) and wire up `src/github/oauth.ts` with PKCE or server-side exchange.
4. Implement kit download/unzip and caching of assets into Cache Storage in `src/kits/kitLoader.ts`.
5. Implement AI provider calls in `src/ai/keyManager.ts`.

This scaffold follows the architecture plan and leaves clear TODOs for the interactive and networked pieces that require sensitive credentials or server components.
