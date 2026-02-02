import './globals.css'
import {Chivo, Geist, Instrument_Serif, Pinyon_Script} from 'next/font/google'

const body = Chivo({
  subsets: ['latin'],
  variable: '--font-body',
})

const heading = Instrument_Serif({
  weight: "400",
  variable: '--font-heading',
})

const headingHover = Pinyon_Script({
  weight: "400",
  variable: '--font-heading-hover',
})

// const heading = Geist({
//   subsets: ['latin'],
//   variable: '--font-heading',

// })

export default async function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable} ${headingHover.variable}`}>
      <body>{children}</body>
    </html>
  )
}
