import './globals.css'
import "@vidstack/react/player/styles/base.css";
import {Chivo, Geist, Manrope, Pinyon_Script} from 'next/font/google'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Style Up Studio',
};

const body = Chivo({
  subsets: ['latin'],
  variable: '--font-body',
})

// const body = Geist({
//   subsets: ['latin'],
//   variable: '--font-body',
// })

export default async function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
