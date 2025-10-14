'use server' // indicates server-side code in Next.js 13+ App Router
import { NextResponse } from 'next/server'

// Simple in-memory cache
let videoCache = {}

export async function GET(request, { params }) {
  const { id } = params

  // Serve from cache if available
  if (videoCache[id] && Date.now() - videoCache[id].time < 3600000) {
    return NextResponse.json({ video: videoCache[id].data })
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${id}&key=${process.env.YOUTUBE_API_KEY}`
    )

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `YouTube API error: ${res.status} ${text}` },
        { status: res.status }
      )
    }

    const data = await res.json()

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Cache the video data for 1 hour
    videoCache[id] = {
      data: data.items[0],
      time: Date.now(),
    }

    return NextResponse.json({ video: data.items[0] })
  } catch (err) {
    console.error('VideoPage fetch error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
