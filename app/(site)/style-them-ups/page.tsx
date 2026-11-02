import ImageSelector from '@/features/style-them-ups/components/ImageSelector/ImageSelector'
import type { Metadata } from 'next'
import {readdir} from 'node:fs/promises'
import path from 'node:path'
import styles from './page.module.css'
import { client } from '@/sanity/lib/client'
import ImageBuilder from '@/features/style-them-ups/components/ImageBuilder/ImageBuilder'

const sections = [
  {type: 'head', folder: 'heads'},
  {type: 'body', folder: 'bodies'},
  {type: 'legs', folder: 'legs'},
] as const

export const metadata: Metadata = {
  title: 'Style Them Ups',
  alternates: {
    canonical: '/style-them-ups',
  },
}

export default async function StyleThemUpsPage() {
  const selectors = await Promise.all(sections.map(async ({type, folder}) => {
    const files = await readdir(path.join(process.cwd(), 'public', 'style-them-ups', folder), {withFileTypes: true})
    const images = files
      .filter(file => file.isFile() && /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(file.name))
      .map(file => file.name)
      .sort((a, b) => a.localeCompare(b, 'en', {numeric: true}))
      .map(name => `/style-them-ups/${folder}/${encodeURIComponent(name)}`)
    return {type, images}
  }))

  const submissions = await client.fetch(
    `*[_type == "styleThemUp"] | order(_createdAt desc)[0...100] {
      _id,
      head,
      body,
      legs,
      date
    }`,
    {},
    { cache: 'no-store' }
  )

return (
  <main className={styles.main}>
    <ImageBuilder selectors={selectors}/>
    <div className={styles.submissions}>
      {submissions.map((submission: {
        _id: string
        head: string
        body: string
        legs: string
        date: string
      }) => (
        <div className={styles.submission} key={submission._id}>
          <img src={`${submission.head}`} alt="" loading="lazy"/>
          <img src={`${submission.body}`} alt="" loading="lazy"/>
          <img src={`${submission.legs}`} alt="" loading="lazy"/>
          <div>{new Date(submission.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
        </div>
      ))}
    </div>
  </main>
)
}
