const fetch = require('node-fetch')

exports.handler = async function(event) {
  const body = JSON.parse(event.body)
  const code = body.code
  const redirect_uri = body.redirect_uri

  if(!code) return { statusCode: 400, body: 'Missing code' }

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
    redirect_uri,
  })

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: params.toString()
  })

  const data = await res.json()
  return { statusCode: 200, body: JSON.stringify(data) }
}
