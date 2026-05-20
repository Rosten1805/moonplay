import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const user = process.env.AUTH_USER
  const pass = process.env.AUTH_PASS

  if (!user || !pass) return NextResponse.next()

  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    const encoded = authHeader.replace('Basic ', '')
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
    const [u, p] = decoded.split(':')
    if (u === user && p === pass) return NextResponse.next()
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Moonplay"' },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.webp$|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)'],
}
