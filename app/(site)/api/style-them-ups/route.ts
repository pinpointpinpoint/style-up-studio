import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function POST(request: Request) {
  try {
    const { head, body, legs } = await request.json()

    const selections = { head, body, legs }

    if (
      !Object.entries(selections).every(
        ([type, image]) =>
          typeof image === 'string' &&
          image.startsWith(`/style-them-ups/${type === 'head' ? 'heads' : type === 'body' ? 'bodies' : 'legs'}/`) &&
          !image.includes('..')
      )
    ) {
      return NextResponse.json({ error: 'Invalid selection' }, { status: 400 })
    }

    const result = await client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    }).create({
      _type: 'styleThemUp',
      ...selections,
      date: new Date().toISOString(),
    })

    return NextResponse.json({ id: result._id })
  } catch {
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}