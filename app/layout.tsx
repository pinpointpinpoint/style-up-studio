import './globals.css'
import '@/styles/index.css'
import {Geist} from 'next/font/google'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Style Up Studio',
};

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
