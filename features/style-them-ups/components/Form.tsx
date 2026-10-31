'use client'

import { useState } from 'react'
import ImageSelector from '@/features/style-them-ups/components/ImageSelector'

type Section = {
  type: 'head' | 'body' | 'legs'
  images: string[]
}

export default function StyleThemUpsForm({ selectors }: { selectors: Section[] }) {
  const [selected, setSelected] = useState({
    head: '',
    body: '',
    legs: '',
  })

//   const [selected, setSelected] = useState({
//   head: selectors.find(s => s.type === 'head')?.images[0] ?? '',
//   body: selectors.find(s => s.type === 'body')?.images[0] ?? '',
//   legs: selectors.find(s => s.type === 'legs')?.images[0] ?? '',
// })

    async function handleSubmit() {
    if (!selected.head || !selected.body || !selected.legs) return

    try {
        const response = await fetch('/api/style-them-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selected),
        })

        if (!response.ok) throw new Error('Submission failed')

        alert('Submitted!')
    } catch (error) {
        console.error(error)
        alert('Something went wrong')
    }
    }

  return (
    <>
      {selectors.map(({ type, images }) => (
        <ImageSelector
          key={type}
          type={type}
          images={images}
          onChange={(image: string) =>
            setSelected(prev => ({ ...prev, [type]: image }))
          }
        />
      ))}

      <button onClick={handleSubmit}>Submit</button>
    </>
  )
}