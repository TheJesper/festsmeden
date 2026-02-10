import { NextResponse } from 'next/server'
import { getStorage, setStorage, deleteStorage } from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  const shared = searchParams.get('shared') !== 'false'

  if (!key) {
    return NextResponse.json({ error: 'key required' }, { status: 400 })
  }

  const value = await getStorage(key, shared)

  if (value === null) {
    return NextResponse.json(null)
  }

  return NextResponse.json({ key, value, shared })
}

export async function POST(request) {
  const body = await request.json()
  const { key, value, shared = true } = body

  if (!key) {
    return NextResponse.json({ error: 'key required' }, { status: 400 })
  }

  const success = await setStorage(key, value, shared !== false)

  if (!success) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ key, value, shared: shared !== false })
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  const shared = searchParams.get('shared') !== 'false'

  if (!key) {
    return NextResponse.json({ error: 'key required' }, { status: 400 })
  }

  await deleteStorage(key, shared)

  return NextResponse.json({ key, deleted: true, shared })
}
