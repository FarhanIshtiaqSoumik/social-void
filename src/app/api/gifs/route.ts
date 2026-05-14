import { NextRequest, NextResponse } from 'next/server'

const TENOR_API_KEY = 'AIzaSyAyimkuYQYF_FXVALexPuGQmf3i9Uj1oLE'
const TENOR_BASE_URL = 'https://tenor.googleapis.com/v2'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q') || ''
  const pos = searchParams.get('pos') || ''
  const limit = '20'

  try {
    let url: string
    if (q.trim()) {
      // Search for GIFs
      url = `${TENOR_BASE_URL}/search?q=${encodeURIComponent(q)}&key=${TENOR_API_KEY}&limit=${limit}&pos=${pos}`
    } else {
      // Trending GIFs when no search query
      url = `${TENOR_BASE_URL}/featured?key=${TENOR_API_KEY}&limit=${limit}&pos=${pos}`
    }

    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      // Fallback to alternative Tenor endpoint
      const fallbackKey = 'LIVDSRZULELA'
      const fallbackBase = 'https://g.tenor.com/v1'
      if (q.trim()) {
        url = `${fallbackBase}/search?q=${encodeURIComponent(q)}&key=${fallbackKey}&limit=${limit}&pos=${pos}`
      } else {
        url = `${fallbackBase}/trending?key=${fallbackKey}&limit=${limit}&pos=${pos}`
      }

      const fallbackResponse = await fetch(url)
      if (!fallbackResponse.ok) {
        return NextResponse.json(
          { gifs: [], next: '' },
          { status: 200 }
        )
      }

      const fallbackData = await fallbackResponse.json()
      const gifs = (fallbackData.results || []).map((gif: Record<string, unknown>) => {
        const media = gif.media as Array<Record<string, Record<string, unknown>>> | undefined
        const firstMedia = media?.[0]
        const gifObj = firstMedia?.['gif'] as Record<string, unknown> | undefined
        const tinygif = firstMedia?.['tinygif'] as Record<string, unknown> | undefined
        return {
          id: gif.id,
          url: (gifObj?.url as string) || (tinygif?.url as string) || '',
          preview_url: (tinygif?.url as string) || (gifObj?.url as string) || '',
          title: (gif.title as string) || '',
        }
      })

      return NextResponse.json({
        gifs,
        next: (fallbackData.next as string) || '',
      })
    }

    const data = await response.json()
    const gifs = (data.results || []).map((gif: Record<string, unknown>) => {
      const media = gif.media as Array<Record<string, Record<string, unknown>>> | undefined
      const firstMedia = media?.[0]
      const gifObj = firstMedia?.['gif'] as Record<string, unknown> | undefined
      const tinygif = firstMedia?.['tinygif'] as Record<string, unknown> | undefined
      return {
        id: gif.id,
        url: (gifObj?.url as string) || (tinygif?.url as string) || '',
        preview_url: (tinygif?.url as string) || (gifObj?.url as string) || '',
        title: (gif.title as string) || '',
      }
    })

    return NextResponse.json({
      gifs,
      next: (data.next as string) || '',
    })
  } catch {
    return NextResponse.json(
      { gifs: [], next: '' },
      { status: 200 }
    )
  }
}
