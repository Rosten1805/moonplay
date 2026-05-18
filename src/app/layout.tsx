import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Moonplay — YouTube Downloader',
  description: 'Local synthwave YouTube downloader. Download MP3 and MP4.',
  icons: {
    icon: '/logo.webp',
    apple: '/logo.webp',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-synth-bg antialiased">{children}</body>
    </html>
  )
}
