// Placeholder helpers for GitHub OAuth PKCE flow and commit helpers.
// NOTE: You must register an OAuth App or GitHub App and insert client_id and redirect

export async function startOAuthFlow(clientId: string, redirectUri: string){
  // Implement PKCE generation and redirect
  throw new Error('Not implemented: startOAuthFlow')
}

export async function exchangeCodeForToken(code: string){
  throw new Error('Not implemented: exchangeCodeForToken')
}

export async function listUserRepos(token: string){
  const res = await fetch('https://api.github.com/user/repos', { headers: { Authorization: `token ${token}` } })
  if(!res.ok) throw new Error('Failed to list repos')
  return res.json()
}

export async function commitFilesToRepo(token: string, owner: string, repo: string, branch: string, files: Record<string,string>, message = 'Add generated UI'){
  // Simplified approach: create/update each file using the contents API. For production, use a tree/commit approach.
  const results: any = {}
  for(const path of Object.keys(files)){
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type':'application/json'
      },
      body: JSON.stringify({ message, content: btoa(unescape(encodeURIComponent(files[path]))), branch })
    })
    results[path] = await res.json()
  }
  return results
}
