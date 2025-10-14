'use client'
import Link from 'next/link'

export default function VideoCard({ video }) {
  const videoId = video.id.videoId || video.id
  const { title, thumbnails, channelTitle } = video.snippet

  return (
    <Link
      href={`/video/${videoId}`}
      className="block bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <img
        src={thumbnails.high.url}
        alt={title}
        className="w-full h-48 md:h-56 object-cover transform hover:scale-105 transition-transform duration-300"
      />
      <div className="p-3">
        <h3 className="text-white font-semibold text-lg md:text-xl line-clamp-2">{title}</h3>
        <p className="text-gray-400 text-sm mt-1">{channelTitle}</p>
      </div>
    </Link>
  )
}
