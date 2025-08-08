import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'

  // Handle auth errors from Supabase
  if (error) {
    console.error('Auth error from Supabase:', { error, errorDescription })
    const errorParam = error === 'access_denied' ? 'access_denied' : 'auth_error'
    return NextResponse.redirect(new URL(`/signup?error=${errorParam}&message=${encodeURIComponent(errorDescription || error)}`, request.url))
  }

  if (code) {
    const supabase = getSupabaseServerClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        
        // Special handling for PKCE errors - redirect to a clean sign-in
        if (error.message?.includes('code verifier') || error.message?.includes('invalid request')) {
          return NextResponse.redirect(new URL('/signup?error=pkce_error&message=Please try signing in again', request.url))
        }
        
        return NextResponse.redirect(new URL(`/signup?error=session_exchange_error&message=${encodeURIComponent(error.message)}`, request.url))
      }
      
      // Log successful authentication
      if (data.user) {
        console.log('Successfully authenticated user:', data.user.email)
      }
      
    } catch (error: any) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(new URL(`/signup?error=callback_exception&message=${encodeURIComponent(error.message || 'Unknown error')}`, request.url))
    }
  }

  // Redirect to the requested page or home
  return NextResponse.redirect(new URL(next, request.url))
}
