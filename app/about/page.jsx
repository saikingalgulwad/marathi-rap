'use client'

import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'

export default function AboutPage() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch('https://api.github.com/users/saikingalgulwad/repos?sort=updated&per_page=10')
        const data = await res.json()
        setRepos(data)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchRepos()
  }, [])

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6">
        {/* About Me */}
        <section className="p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 mb-12">
          <h1 className="text-4xl font-bold text-yellow-400 mb-6">About Me</h1>
          <p className="text-gray-300 mb-4 text-lg leading-relaxed">
            Hello! I am <strong>Saiprasad Algulwad</strong>, a passionate web developer and fan of Marathi Rap music. 
            This website showcases curated Marathi rap songs from YouTube.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            Check out my GitHub for more projects:{' '}
            <a
              href="https://github.com/saikingalgulwad"
              target="_blank"
              className="text-yellow-400 hover:underline"
            >
              https://github.com/saikingalgulwad
            </a>
          </p>
        </section>

        {/* GitHub Repositories */}
        <section>
          <h2 className="text-3xl font-bold text-yellow-400 mb-6">My Projects</h2>

          {loading ? (
            <p className="text-gray-300">Loading repositories...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.map(repo => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  className="p-6 bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl hover:bg-gray-700 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-yellow-400 mb-2">{repo.name}</h3>
                  <p className="text-gray-300 mb-2">
                    {repo.description || 'No description'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    ⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}
                  </p>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
