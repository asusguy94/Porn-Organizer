export function middleware() {
  return new Response('This is the old api, use the new one instead', { status: 410 })
}

export const config = {
  matcher: '/api/:path*'
}
