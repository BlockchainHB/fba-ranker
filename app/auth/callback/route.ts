import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = getSupabaseServerClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/signup?error=auth_callback_error', request.url))
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(new URL('/signup?error=auth_callback_error', request.url))
    }
  }

  // Redirect to the requested page or home
  return NextResponse.redirect(new URL(next, request.url))
}
