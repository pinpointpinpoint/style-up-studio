import './globals.css'
import '@/styles/index.css'
import {Geist, Chivo} from 'next/font/google'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Style Up Studio',
};

// const body = Geist({
//   subsets: ['latin'],
//   variable: '--font-body',
// })

const body = Chivo({
  subsets: ['latin'],
  variable: '--font-body',
  weight: "300"
})

export default async function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
