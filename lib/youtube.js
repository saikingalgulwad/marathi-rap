// Server-side helper to call internal YouTube proxy
export async function searchMarathiRap(query = 'Marathi Rap Songs', maxResults = 18, pageToken) {
  // NOTE: In server components use a relative fetch to /api/youtube
  const res = await fetch(`/api/youtube`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, maxResults, pageToken })
  })
  return res.json()
}
