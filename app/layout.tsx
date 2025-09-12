import type { Metadata } from 'next'
import './globals.css'
import './fonts.css'
import { Toaster } from "@/components/ui/toaster"
import SiteRulesProvider from "@/components/SiteRulesProvider"

export const metadata: Metadata = {
  title: 'Nền tảng học tập trực tuyến',
  description: 'Nền tảng học tập trực tuyến',
  generator: 'Nền tảng học tập trực tuyến',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>
          {`
              html {
                font-family: 'Be Vietnam Pro', sans-serif;
                --font-sans: 'Be Vietnam Pro', sans-serif;
                --font-mono: 'Be Vietnam Pro', sans-serif;
              }
        `}
        </style>
      </head>
      <body>
        <SiteRulesProvider>
          {children}
        </SiteRulesProvider>
        <Toaster />
      </body>
    </html>
  )
}
