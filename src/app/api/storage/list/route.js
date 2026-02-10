import { NextResponse } from 'next/server'
import { listStorage } from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const prefix = searchParams.get('prefix') || ''
  const shared = searchParams.get('shared') !== 'false'

  const keys = await listStorage(prefix, shared)

  return NextResponse.json({ keys, prefix: prefix || null, shared })
}
