// commitHelpers.ts - functions to exchange code for token and create commits using a user's access token

import { sha256 } from './pkce'

export async function exchangeCodeForToken({ client_id, code, code_verifier, redirect_uri }: { client_id: string; code: string; code_verifier: string; redirect_uri: string }) {
  // GitHub supports exchanging code for token at https://github.com/login/oauth/access_token
  // For PKCE-enabled OAuth apps, client_secret is not required. We'll attempt a direct POST and return the parsed JSON response.
  const url = 'https://github.com/login/oauth/access_token'
  const body = new URLSearchParams({
    client_id,
    code,
    code_verifier,
    redirect_uri,
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error('Token exchange failed: ' + text)
  }

  const data = await res.json()
  // data should contain access_token on success, or error
  return data
}

export async function getUser(token: string) {
  const res = await fetch('https://api.github.com/user', { headers: { Authorization: `token ${token}` } })
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

export async function listUserRepos(token: string) {
  const repos: any[] = []
  let page = 1
  while (true) {
    const res = await fetch(`https://api.github.com/user/repos?per_page=100&page=${page}`, { headers: { Authorization: `token ${token}` } })
    if (!res.ok) throw new Error('Failed to list repos')
    const data = await res.json()
    repos.push(...data)
    if (data.length < 100) break
    page++
  }
  return repos
}

export async function listBranches(token: string, owner: string, repo: string) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, { headers: { Authorization: `token ${token}` } })
  if (!res.ok) throw new Error('Failed to list branches')
  return res.json()
}

async function createBlob(token: string, owner: string, repo: string, content: string) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
    method: 'POST',
    headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, encoding: 'utf-8' }),
  })
  if (!res.ok) throw new Error('Failed to create blob')
  return (await res.json()).sha
}

export async function createCommitToBranch(token: string, owner: string, repo: string, branch: string, files: Record<string, string>, message = 'Add generated UI') {
  // 1. Get reference for the branch
  const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`, { headers: { Authorization: `token ${token}` } })
  if (!refRes.ok) {
    throw new Error('Failed to get branch ref. Ensure the branch exists and token has repo scope.')
  }
  const refData = await refRes.json()
  const baseCommitSha = refData.object.sha

  // 2. Get the full commit to obtain the tree sha
  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${baseCommitSha}`, { headers: { Authorization: `token ${token}` } })
  if (!commitRes.ok) throw new Error('Failed to fetch base commit')
  const commitData = await commitRes.json()
  const baseTreeSha = commitData.tree.sha

  // 3. Create blobs for each file
  const entries = [] as any[]
  for (const path of Object.keys(files)) {
    const content = files[path]
    const blobSha = await createBlob(token, owner, repo, content)
    entries.push({ path, mode: '100644', type: 'blob', sha: blobSha })
  }

  // 4. Create a new tree
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ base_tree: baseTreeSha, tree: entries }),
  })
  if (!treeRes.ok) {
    const text = await treeRes.text()
    throw new Error('Failed to create tree: ' + text)
  }
  const treeData = await treeRes.json()

  // 5. Create a commit
  const commitRes2 = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, tree: treeData.sha, parents: [baseCommitSha] }),
  })
  if (!commitRes2.ok) {
    const text = await commitRes2.text()
    throw new Error('Failed to create commit: ' + text)
  }
  const newCommit = await commitRes2.json()

  // 6. Update the reference to point to the new commit
  const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: 'PATCH',
    headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha: newCommit.sha }),
  })
  if (!updateRefRes.ok) {
    const text = await updateRefRes.text()
    throw new Error('Failed to update ref: ' + text)
  }

  return { commit: newCommit }
}
