export const runtime = "edge"

export async function GET(request: Request) {
  // const url = request.url
  const url = new URL(request.url)
  const chainbaseApiPath = url.pathname.replace('/api/chainbase/', '')

  try {
    // target URL
    const baseUrl = 'https://api.chainbase.online/v1/'
    const params = url.searchParams
    params.delete('params')
    const targetUrl =
      baseUrl + chainbaseApiPath + '?' + url.searchParams.toString()

    console.log(targetUrl)

    // use fetch request target URL
    const response = await fetch(targetUrl, {
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.CHAINBASE_API_KEY || '2UNbKHKJzdbrmw22VdVrwEWA6kp',
      },
    })

    // check the response success or not
    if (!response.ok) {
      return new Response('Error', {
        status: response.status,
      })
    }

    if (response.body) {
      // Send the streaming response from the target server to the client.
      return new Response(response.body as any as ReadableStream)
    } else {
      return new Response('Error', {
        status: 500,
      })
    }
  } catch (error) {
    return new Response('Error', {
      status: 500,
    })
  }
}


export async function POST(request: Request) {
  // const url = request.url
  const url = new URL(request.url)
  const body = await request.text()

  const chainbaseApiPath = url.pathname.replace('/api/chainbase/', '')

  try {
    // target URL
    url.searchParams.delete('params')
    const baseUrl = 'https://api.chainbase.online/v1/'
    const targetUrl =
      baseUrl + chainbaseApiPath 

    // use fetch request target URL
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.CHAINBASE_API_KEY || 'demo',
      },
      body: body,
    })
    console.log(response.ok, response.status)

    // check if the response success
    if (!response.ok) {
      return new Response('Error', {
        status: response.status,
      })
    }

    if (response.body) {
      // Send the streaming response from the target server to the client.
      return new Response(response.body as any as ReadableStream)
    } else {
      return new Response('Error', {
        status: 500,
      })
    }
  } catch (error) {
    console.log(error)
    return new Response('Error', {
      status: 500,
    })
  }
}
