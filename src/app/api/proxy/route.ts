import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()

  const targetUrl = body.url
  const method = body.method
  const data = body.data?.input || body.data // Handle both formats

  // Validate array input if present
  if (Array.isArray(data)) {
    const isArrayOfNumbers = data.every(item => typeof item === 'number')
    const isArrayOfStrings = data.every(item => typeof item === 'string')
    
    if (!isArrayOfNumbers && !isArrayOfStrings) {
      return NextResponse.json({ 
        error: "Array must contain only numbers or only strings" 
      }, { status: 400 })
    }
  }

  console.log('Proxy request:', { targetUrl, method, data })
  try {
    const response = await fetch(targetUrl, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: method && !['GET', 'HEAD'].includes(method) && data ? JSON.stringify(data) : undefined
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
    return NextResponse.json(
      { 
        error: 'Failed to fetch from target URL',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}
