import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()

  const targetUrl = body.url
  const method = body.method
  const data = body.data // Keep the original data structure

  // Debug log with full object structure
  console.log('Proxy request:', JSON.stringify({ targetUrl, method, data }, null, 2))

  try {
    const response = await fetch(targetUrl, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: method && !['GET', 'HEAD'].includes(method) ? JSON.stringify(data) : undefined
    })

    console.log(`Proxy response: ${response.status} ${response.statusText}`)

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
    return NextResponse.json(
      { 
        error: 'Failed to fetch from target URL',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}
