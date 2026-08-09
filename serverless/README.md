# Serverless token exchange example (Netlify)

This is an example serverless function you can deploy to perform the code -> token exchange server-side using your OAuth App client_secret.

File: netlify/functions/exchange-token.js

Environment variables required:
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET

Note: Deploying this function will keep your client_secret on the server and allow the browser to request a token via this function instead of exchanging directly with GitHub.
