'use client'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-yellow-400 hover:text-yellow-500">
        MarathiRap
      </Link>

      <div className="flex gap-4">
        <Link
          href="/about"
          className="hover:text-yellow-400 transition-colors font-semibold"
        >
          About
        </Link>
      </div>
    </nav>
  )
}
