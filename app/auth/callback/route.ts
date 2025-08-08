import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'

  // Handle auth errors from Supabase
  if (error) {
    console.error('Auth error from Supabase:', { error, errorDescription })
    const errorParam = error === 'access_denied' ? 'access_denied' : 'auth_error'
    return NextResponse.redirect(new URL(`/signup?error=${errorParam}&message=${encodeURIComponent(errorDescription || error)}`, request.url))
  }

  // For implicit flow, tokens are passed as URL fragments, but we can also get them as query params
  if (accessToken && refreshToken) {
    console.log('Received tokens via implicit flow')
    // The client-side Supabase client will handle these tokens automatically
    // Just redirect to the intended destination
    return NextResponse.redirect(new URL(next, request.url))
  }

  // Fallback: redirect to home even if no explicit tokens (client will handle session detection)
  return NextResponse.redirect(new URL(next, request.url))
}
