import type { Metadata } from 'next'
import { Rubik } from 'next/font/google'
import './globals.css'
import 'ol/ol.css'

const rubik = Rubik({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MapSync',
  description: 'Uma aplicação de mapeamento web',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en overflow-hidden">
      <body className={rubik.className}>{children}</body>
    </html>
  )
}
