const URL_ACESSO = 'https://lnshksoszkiifrqzjmkt.supabase.co/functions/v1/acesso'

export async function acesso<T = Record<string, unknown>>(corpo: Record<string, unknown>): Promise<T> {
  const r = await fetch(URL_ACESSO, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error((j as { erro?: string }).erro || 'Falha na conexão')
  return j as T
}
