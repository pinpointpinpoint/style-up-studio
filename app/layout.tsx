import './globals.css'
import {Chivo, Geist} from 'next/font/google'

const body = Chivo({
  subsets: ['latin'],
  variable: '--font-body',
})

// const heading = Geist({
//   subsets: ['latin'],
//   variable: '--font-heading',

// })

export default async function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${body.variable} `}>
      <body>{children}</body>
    </html>
  )
}
