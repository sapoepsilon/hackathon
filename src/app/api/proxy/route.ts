import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()

  const targetUrl = body.url
  const method = body.method
  const data = body.data

  try {
    const response = await fetch(targetUrl, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...((method && !['GET', 'HEAD'].includes(method) && data) && { body: JSON.stringify(data) }),
    })

    const contentType = response.headers.get('content-type')
    let responseData

    if (contentType?.includes('application/json')) {
      responseData = await response.json()
    } else {
      responseData = await response.text()
    }

    return NextResponse.json({ data: responseData })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch from target URL' }, { status: 500 })
  }
}
