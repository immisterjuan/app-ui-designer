# GitHub OAuth + PKCE (client-side)

This PR adds a client-side OAuth Authorization Code flow with PKCE so users can authorize the app to push generated projects into their own GitHub repositories.

Files added in feature/github-oauth:
- src/github/pkce.ts — PKCE helpers (code_verifier, code_challenge)
- src/github/OAuthPanel.tsx — UI for the user to input a client_id and start the OAuth flow
- src/github/OAuthCallback.tsx — callback page that exchanges the code for an access token
- src/github/commitHelpers.ts — token exchange + GitHub repo listing + atomic commit helpers (blobs, tree, commit, update-ref)
- src/persistence/idb.ts — extended with saveSetting/loadSetting and token helpers (saveToken/loadToken/deleteToken)
- src/App.tsx — OAuthPanel included in the left sidebar

Usage notes
1. Register an OAuth App in your GitHub account (Settings → Developer settings → OAuth Apps).
   - Application name: App UI Designer (or your preferred name)
   - Homepage URL: http://localhost:5173 (for local testing)
   - Authorization callback URL: http://localhost:5173/oauth/callback
   - After registering, copy the client_id.

2. Run the app locally (npm install; npm run dev). In the left sidebar, paste the client_id into the OAuth panel and click Connect.

<<<<<<< HEAD
3. After authorizing, GitHub will redirect back to /oauth/callback. The app attempts to exchange the code for an access token using PKCE. On success the token is stored in your browser's IndexedDB and used for Git operations.

Notes & fallback
- If the direct client-side token exchange is blocked or requires a client_secret (depending on how GitHub's app is configured), follow the README instructions to deploy a small serverless token-exchange endpoint and configure the app to use it.
- Access tokens are stored in the user's browser (IndexedDB). The app will NOT send tokens to any external server.
=======
3. After authorizing, GitHub will redirect back to /oauth/callback. The app attempts to exchange the code for an access token using PKCE. On success the token is stored locally in IndexedDB and used for Git operations.

Notes & fallback
- If the direct client-side token exchange is blocked or requires a client_secret (depending on how GitHub's app is configured), follow the README instructions to deploy a small serverless token-exchange endpoint and configure the app to use it.
- Access tokens are stored locally in the browser (IndexedDB). The app will NOT send tokens to any external server.
>>>>>>> feature/github-oauth

Security
- Users should register their own OAuth App or you can register one and provide the client_id. Tokens are stored in the user's browser and can be revoked by clearing the stored token or from GitHub settings.
