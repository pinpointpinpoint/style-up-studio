import './globals.css'
import "@vidstack/react/player/styles/base.css";
import {Chivo, Geist, Pinyon_Script} from 'next/font/google'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Style Up Studio',
};

const body = Chivo({
  subsets: ['latin'],
  variable: '--font-body',
})

const headingHover = Pinyon_Script({
  weight: "400",
  variable: '--font-heading-hover',
})

const heading = Geist({
  subsets: ['latin'],
  variable: '--font-heading',
})

export default async function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable} ${headingHover.variable}`}>
      <body>{children}</body>
    </html>
  )
}
