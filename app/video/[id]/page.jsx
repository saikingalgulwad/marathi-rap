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
        // Main video
        const res = await fetch(`/api/video/${id}`)
        const data = await res.json()
        setVideo(data.video || null)

        // Recommended videos
        if (data.video) {
          const query = encodeURIComponent(data.video.snippet.title)
          const recRes = await fetch(`/api/youtube?q=${query}&maxResults=8`)
          const recData = await recRes.json()
          setRecommended(
            recData.items.filter(v => (v.id.videoId || v.id) !== id) || []
          )
        }
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
        {/* Video Player + Info */}
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

        {/* Recommended Videos Sidebar */}
        <aside className="w-full lg:w-80">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">
            Recommended
          </h2>
          <div className="flex flex-col gap-4">
            {recommended.map(v => (
              <VideoCard key={v.id.videoId || v.id} video={v} />
            ))}
          </div>
        </aside>
      </main>
    </div>
  )
}
