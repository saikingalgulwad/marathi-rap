'use client'

import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import SearchBar from '../components/SearchBar'
import VideoCard from '../components/VideoCard'

export default function Home() {
  const [videos, setVideos] = useState([])
  const [search, setSearch] = useState('Marathi Rap Songs')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true)
      try {
        const res = await fetch(`/api/youtube?q=${encodeURIComponent(search)}&maxResults=18`)
        const data = await res.json()
        setVideos(data.items || [])
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchVideos()
  }, [search])

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6">
      

        {/* Search */}
        <SearchBar onSearch={q => setSearch(q)} />

        {/* Loading */}
        {loading && (
          <div className="text-center mt-20 text-gray-300 text-lg">Loading songs...</div>
        )}

        {/* Video Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {videos.map(v => (
              <VideoCard key={v.id.videoId || v.id} video={v} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
