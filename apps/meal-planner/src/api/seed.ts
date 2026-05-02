import client from './client'

export async function getSeedStatus(): Promise<{ seeded: number; custom: number; seed_complete: boolean }> {
  const { data } = await client.get('/seed/status')
  return data
}

export async function runSeed(): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const { data } = await client.post('/seed/run')
  return data
}

export async function importFromUrl(url: string): Promise<{
  status: 'imported' | 'skipped'
  title: string
  recipe_id: number
  message?: string
}> {
  const { data } = await client.post('/seed/from-url', { url })
  return data
}
