import { createClient } from '@supabase/supabase-js'

// Multi-tenant: Each project sets its ID
const PROJECT_ID = 'festsmeden'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured - using mock storage')
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// In-memory fallback for local dev without Supabase
const memoryStore = { shared: {}, private: {} }

export async function getStorage(key, shared = true) {
  if (!supabase) {
    const store = shared ? memoryStore.shared : memoryStore.private
    return store[key] || null
  }

  const { data, error } = await supabase
    .from('storage')
    .select('value')
    .eq('project_id', PROJECT_ID)
    .eq('key', key)
    .eq('shared', shared)
    .single()

  if (error || !data) return null
  return data.value
}

export async function setStorage(key, value, shared = true) {
  if (!supabase) {
    const store = shared ? memoryStore.shared : memoryStore.private
    store[key] = value
    return true
  }

  const { error } = await supabase
    .from('storage')
    .upsert(
      {
        project_id: PROJECT_ID,
        key,
        value,
        shared,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'project_id,key,shared' }
    )

  return !error
}

export async function deleteStorage(key, shared = true) {
  if (!supabase) {
    const store = shared ? memoryStore.shared : memoryStore.private
    delete store[key]
    return true
  }

  const { error } = await supabase
    .from('storage')
    .delete()
    .eq('project_id', PROJECT_ID)
    .eq('key', key)
    .eq('shared', shared)

  return !error
}

export async function listStorage(prefix = '', shared = true) {
  if (!supabase) {
    const store = shared ? memoryStore.shared : memoryStore.private
    return Object.keys(store).filter(k => !prefix || k.startsWith(prefix))
  }

  let query = supabase
    .from('storage')
    .select('key')
    .eq('project_id', PROJECT_ID)
    .eq('shared', shared)

  if (prefix) {
    query = query.like('key', `${prefix}%`)
  }

  const { data, error } = await query

  if (error || !data) return []
  return data.map(d => d.key)
}
