// api/youtube.js
let cache = {}

export async function GET(req) {
  const url = new URL(req.url)
  const query = url.searchParams.get('q') || 'Marathi Rap Songs'
  const maxResults = parseInt(url.searchParams.get('maxResults') || '12', 10)

  if (cache[query] && Date.now() - cache[query].time < 3600000) { // 1 hour cache
    return new Response(JSON.stringify(cache[query].data))
  }

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${process.env.YOUTUBE_API_KEY}`)
  const data = await res.json()

  if (!data.error) cache[query] = { data, time: Date.now() }

  return new Response(JSON.stringify(data))
}
