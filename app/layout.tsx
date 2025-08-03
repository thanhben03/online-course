import type { Metadata } from 'next'
import './globals.css'
import './fonts.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: 'Be Vietnam Pro', sans-serif;
  --font-sans: 'Be Vietnam Pro', sans-serif;
  --font-mono: 'Be Vietnam Pro', sans-serif;
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
