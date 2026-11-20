const BASE = 'https://pnpdsputyxtmopmdnsgo.supabase.co/functions/v1/'

export async function acesso<T = Record<string, unknown>>(corpo: Record<string, unknown>, fn = 'acesso'): Promise<T> {
  const r = await fetch(BASE + fn, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error((j as { erro?: string }).erro || 'Falha na conexão')
  return j as T
}
