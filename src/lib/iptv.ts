export const PROXY = 'https://lnshksoszkiifrqzjmkt.supabase.co/functions/v1/proxy-stream'

export type Item = { id: string; nome: string; url: string; img?: string; cat?: string }
export type Dados = { tv: Item[]; filmes: Item[]; series: Item[] }
export type Cred = { url: string; usuario: string; senha: string }

const lista = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? (v as Record<string, unknown>[]) : [])
const str = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v) : '')

function norm(arr: unknown, tipo: string): Item[] {
  return lista(arr).map((o, i) => ({
    id: `${tipo}-${str(o.stream_id ?? o.series_id ?? o.id ?? i)}`,
    nome: str(o.name ?? o.nome ?? o.title) || 'Sem nome',
    url: str(o.stream_url ?? o.url ?? o.link),
    img: str(o.stream_icon ?? o.cover ?? o.icon ?? o.logo ?? o.img) || undefined,
    cat: str(o.category_name ?? o.categoria ?? o.group) || undefined,
  }))
}

export async function buscar(c: Cred): Promise<Dados> {
  const r = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(c),
  })
  if (!r.ok) throw new Error('Servidor respondeu com erro ' + r.status)
  const j = (await r.json()) as Record<string, unknown>
  return {
    tv: norm(j.canais ?? j.live ?? j.tv, 'tv'),
    filmes: norm(j.filmes ?? j.movies ?? j.vod, 'filmes'),
    series: norm(j.series ?? j.séries, 'series'),
  }
}

export const lerDados = (): Dados | null => {
  try { return JSON.parse(localStorage.getItem('dc_dados') ?? 'null') } catch { return null }
}
