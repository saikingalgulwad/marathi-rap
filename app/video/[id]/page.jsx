'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '../../../components/Navbar'
import VideoCard from '../../../components/VideoCard'

export default function VideoPage() {
  const { id } = useParams()
  const [video, setVideo] = useState(null)
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVideo() {
      setLoading(true)
      try {
        // ✅ 1. Fetch main video
        const res = await fetch(`/api/video/${id}`)
        const data = await res.json()
        setVideo(data.video || null)

        // ✅ 2. Try YouTube’s *own* recommended videos first
        const relatedRes = await fetch(
          `/api/youtube?relatedToVideoId=${id}&type=video&maxResults=15`
        )
        const relatedData = await relatedRes.json()

        let recommendedVideos = relatedData.items || []

        // ✅ 3. If YouTube recommended videos are empty or not Marathi rap
        // (simple check using title)
        const hasMarathiRap =
          recommendedVideos.filter(v =>
            v.snippet?.title?.toLowerCase().includes('marathi')
          ).length > 0

        if (!hasMarathiRap) {
          // ✅ 4. Fallback: Fetch Marathi rap videos manually
          const marathiRes = await fetch(
            `/api/youtube?q=Marathi+Rap+Music+Video&type=video&maxResults=15`
          )
          const marathiData = await marathiRes.json()
          recommendedVideos = marathiData.items || []
        }

        // ✅ 5. Set recommended list
        setRecommended(recommendedVideos)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }

    fetchVideo()
  }, [id])

  if (loading)
    return <p className="text-center mt-20 text-white text-lg">Loading...</p>

  if (!video)
    return <p className="text-center mt-20 text-white text-lg">Video not found</p>

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
        {/* 🎬 Main Video Section */}
        <div className="flex-1">
          <div className="w-full aspect-video rounded-lg overflow-hidden shadow-xl mb-4">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${id}`}
              title={video.snippet.title}
              allowFullScreen
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-yellow-400">
            {video.snippet.title}
          </h1>
          <p className="text-gray-300 mb-6">{video.snippet.description}</p>
        </div>

        {/* 🎶 Recommended Section */}
        <aside className="w-full lg:w-80">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">
            YouTube Recommended (Marathi Rap)
          </h2>
          <div className="flex flex-col gap-4">
            {recommended.length > 0 ? (
              recommended.map(v => (
                <VideoCard key={v.id.videoId || v.id} video={v} />
              ))
            ) : (
              <p className="text-gray-400">
                No Marathi rap recommendations available.
              </p>
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}
