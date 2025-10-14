import './globals.css'

export const metadata = {
  title: 'Marathi Rap',
  description: 'Marathi rap songs (YouTube) — Next.js app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
       
          {children}
      
      </body>
    </html>
  )
}
