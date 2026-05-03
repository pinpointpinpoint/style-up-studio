import './globals.css'
import "@vidstack/react/player/styles/base.css";
import {Chivo, Fraunces, Geist, Manrope, Pinyon_Script, Plus_Jakarta_Sans, Space_Grotesk} from 'next/font/google'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Style Up Studio',
};

// const body = Chivo({
//   subsets: ['latin'],
//   variable: '--font-body',
// })

// const body = Space_Grotesk({
//   subsets: ['latin'],
//   variable: '--font-body',
// })

const body = Geist({
  subsets: ['latin'],
  variable: '--font-body',
})

export default async function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
