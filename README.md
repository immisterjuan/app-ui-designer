# App UI Designer

Just another Web and Mobile Application UI Designer using known styling frameworks like Tailwind, Bootstrap and many more.

This repository contains a Progressive Web App (PWA) built with Vite + React + TypeScript. The app lets you design wireframes, apply a UI kit (Tailwind Starter Kit example included), export a generated React project, and push the generated files into *your* GitHub repositories using per-user OAuth (PKCE).

---

## Requirements
- Node.js 18+ (recommended)
- npm, pnpm, or yarn
- A modern browser (for the PWA and OAuth flows)

---

## Quick start — install & run locally

1. Clone the repo:

   git clone git@github.com:immisterjuan/app-ui-designer.git
   cd app-ui-designer

2. Install dependencies:

   npm install
   # or
   # pnpm install
   # yarn install

3. Run the development server (Vite):

   npm run dev

   Open the URL shown by Vite (usually http://localhost:5173).

4. Build for production:

   npm run build

   This produces a `dist/` folder. You can preview the production build with:

   npm run preview

---

## App features (high level)
- Offline-capable PWA shell (service worker via `vite-plugin-pwa`) — core app shell loads offline.
- Wireframe editor (React Flow) and IndexedDB persistence for wireframes and kits.
- UI Kit system: built-in Tailwind Starter Kit example (manifest, mapping), runtime CSS injection and offline caching of kit CSS.
- Per-user GitHub OAuth (Authorization Code + PKCE): users authorize the app with their own OAuth App `client_id`, token stored locally in the browser.
- Export generator: converts a wireframe into a minimal React + TypeScript project (TSX + CSS) and previews files.
- Repo/branch commit UI: preview generated files and perform an atomic commit to the selected GitHub repository/branch (create blobs → create tree → create commit → update ref).

---

## Using the app (step-by-step)

### 1) Start the app
- Run `npm run dev` and open http://localhost:5173.

### 2) Load a UI Kit (Tailwind example)
- In the left sidebar, open "UI Kits" and click the built-in "Tailwind Starter Kit" button.
- The app will fetch the manifest and CSS (demo uses a compiled Tailwind CSS) and inject the stylesheet into the page. The CSS is also persisted in IndexedDB for offline use.
- After loading, the current kit is set and the preview pane will render mapped primitives (button, card, alert, etc.).

Notes:
- The Tailwind Starter Kit included is a demo mapping that uses compiled utility classes. For full offline guarantees, we bundle the compiled CSS; if you change the manifest to a remote CDN, the app will fetch it and ask for consent before caching.

### 3) Connect your GitHub account (per-user OAuth PKCE)
- In GitHub, register an OAuth App (Settings → Developer settings → OAuth Apps):
  - Application name: App UI Designer (or your preferred name)
  - Homepage URL: http://localhost:5173 (for local testing)
  - Authorization callback URL: http://localhost:5173/oauth/callback
- Copy the `client_id` from the OAuth App settings.
- In the app left sidebar, paste the `client_id` into the GitHub Connect panel and click "Connect to GitHub".
- You will be redirected to GitHub to authorize. After allowing, GitHub will redirect back to `/oauth/callback` and the app will exchange the code for an access token (PKCE) and store it locally in IndexedDB.

Security note:
- The access token is stored only in your browser and is not sent to any external server by default. The app requests `repo` scope to allow commits. Review scopes and revoke access in your GitHub account settings if desired.

### 4) Generate & preview files
- Use the editor to create or load a wireframe (save/load uses IndexedDB).
- In the left sidebar open "Export & Push".
- Click "Generate preview files" to produce a minimal Vite + React + TypeScript project from the current wireframe. Preview files (package.json, index.html, src files) will be shown.

### 5) Commit generated files to your repository
- After generating the preview files, select one of your repositories from the listed repos (the app lists repos using your stored token).
- Choose a target branch (the UI will fetch branches for the selected repo).
- Click "Commit to repo" to perform an atomic commit (the app uses GitHub's git data API to create blobs → create tree → create commit → update-ref).
- Confirm the commit on GitHub by viewing the repo/branch.

Notes:
- The app performs per-file blob creation and atomic commit so changes land in a single commit.
- Ensure your token has appropriate permissions (repo scope) and the target branch exists or is writable.

---

## Server-side token exchange (optional fallback)

Some OAuth configurations or provider changes may require a server-side code→token exchange. A Netlify serverless example is provided at `serverless/netlify/exchange-token.js` (reads `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from environment variables). If you prefer server-side exchange:

1. Deploy the function to your serverless provider (Netlify, Vercel, AWS Lambda).
2. Update the app's OAuth callback logic to POST the `code` and `redirect_uri` to your serverless endpoint and receive the token in response.

Security note: keeping the client_secret on the server is more secure for long-term production usage. For early-stage/quick demos PKCE client-side is acceptable.

---

## Build & deployment

1. Build the static assets:

   npm run build

   This creates the `dist/` directory.

2. Deploy `dist/` to any static host (Netlify, Vercel, GitHub Pages, S3 + CloudFront).

3. If you deploy to a production domain, register your GitHub OAuth App with the production callback URL (e.g. https://yourdomain.com/oauth/callback) and use that `client_id` in the app's Connect UI.

---

## Development notes & TODOs
- Kit system: current mapping supports tag + className transforms. To support full React component kits we'd add a trusted component bundle or mapping adapters.
- Tailwind use: the demo uses a compiled Tailwind CSS file. Using Tailwind JIT in the browser is not supported; prefer compiled kit CSS for offline use.
- AI integration: placeholders exist for storing user API keys and calling providers; implement and secure provider-specific calls before enabling.
- Tests & CI: add GitHub Actions for lint/build/test before merging feature branches into main.

---

## Troubleshooting
- "Token exchange failed" on /oauth/callback: try using the serverless exchange function or verify that your OAuth App is configured for PKCE and has the correct callback URL.
- CSS not applying after loading kit: ensure the kit includes a compiled stylesheet and the manifest references it correctly. Check browser console for fetch errors.

---

## Contributing
Contributions welcome. Recommended workflow:
- Fork the repo, create a feature branch, open a pull request to `main`.
- Keep secrets out of commits. Use the serverless templates and environment variables for any client_secret.

---

## License
See individual kit manifests for kit licenses. The scaffold code is provided under the MIT License (add LICENSE file if you want a formal license in the repo).
