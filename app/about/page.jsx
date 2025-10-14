'use client'

import { useState } from 'react'
import Navbar from '../../components/Navbar'


export default function AboutPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    if (!name || !email || !message) {
      setStatus('Please fill all fields')
      return
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      })

      if (res.ok) {
        setStatus('Feedback submitted successfully!')
        setName('')
        setEmail('')
        setMessage('')
      } else {
        setStatus('Failed to submit feedback')
      }
    } catch (err) {
      console.error(err)
      setStatus('Error submitting feedback')
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto p-6">
        {/* About Me */}
        <section className="mb-12 p-6 bg-gray-800 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-yellow-400 mb-4">About Me</h1>
          <p className="text-gray-300 mb-4">
            Hello! I am <strong>Saiprasad Algulwad</strong>, a passionate web developer and
            fan of Marathi Rap music. This website showcases curated Marathi rap songs
            from YouTube.
          </p>
          <p className="text-gray-300">
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

        {/* Feedback Form */}
        <section className="p-6 bg-gray-800 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Feedback</h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <textarea
              placeholder="Message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none h-32"
            />
            <button
              type="submit"
              className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Submit Feedback
            </button>
            {status && <p className="text-gray-300 mt-2">{status}</p>}
          </form>
        </section>
      </main>
    </div>
  )
}
