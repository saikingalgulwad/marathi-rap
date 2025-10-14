'use client'
import { useState } from 'react'

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    if (query.trim() !== '') onSearch(query)
    setQuery('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 mb-6 w-full max-w-md mx-auto"
    >
      <input
        type="text"
        placeholder="Search Marathi Rap Songs..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="flex-1 p-3 rounded-l-xl text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <button
        type="submit"
        className="bg-yellow-400 text-black font-bold px-6 rounded-r-xl hover:bg-yellow-500 transition-colors"
      >
        Search
      </button>
    </form>
  )
}
