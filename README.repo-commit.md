# Repo Commit UI and Export Generator

This feature branch implements:
- A RepoCommitPanel UI to list user repositories/branches and push generated files to a chosen branch via GitHub API (atomic commit).
- A simple export generator that creates a minimal Vite + React + TypeScript project from the current wireframe.
- A serverless token-exchange template (Netlify) for environments that require a server-side token exchange.

How to test
- Checkout feature/repo-commit-ui
- Run the app and connect to GitHub via OAuth PKCE (feature/github-oauth). Ensure you have a token stored in the browser by completing the OAuth flow.
- In the left sidebar, after connecting, open "Export & Push", select a repo, generate preview files, and commit.

Notes
- The generator is minimal and intended as a starting point; expand templates and handle assets as needed.
