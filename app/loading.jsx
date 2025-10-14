'use client'

export default function Loading() {
  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-yellow-400 font-semibold text-lg">Loading Marathi Rap Songs...</p>
      </div>
    </div>
  )
}