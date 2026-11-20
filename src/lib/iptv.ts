export const PROXY = 'https://pnpdsputyxtmopmdnsgo.supabase.co/functions/v1/proxy-stream'

export type Ep = { id: string; nome: string; url: string }
export type Temp = { n: string; eps: Ep[] }
export type Item = {
  id: string; nome: string; url: string; img?: string; cat?: string
  nota?: number; sinopse?: string; elenco?: string; duracao?: string; qualidade?: string; ano?: string; temps?: Temp[]
}
export type Dados = { tv: Item[]; filmes: Item[]; series: Item[] }
export type Cred = { url: string; usuario: string; senha: string }

const lista = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? (v as Record<string, unknown>[]) : [])
const str = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v) : '')

function norm(arr: unknown, tipo: string): Item[] {
  return lista(arr).map((o, i) => {
    const r = Number(o.rating_5based ?? (Number(o.rating) ? Number(o.rating) / 2 : o.nota))
    const ts = lista(o.seasons ?? o.temporadas).map((t, k) => ({
      n: str(t.name ?? t.numero ?? t.season_number) || String(k + 1),
      eps: lista(t.episodes ?? t.episodios).map((e, j) => ({ id: `${str(e.id ?? j)}`, nome: str(e.title ?? e.name ?? e.nome) || `Episódio ${j + 1}`, url: str(e.stream_url ?? e.url ?? e.link) })),
    }))
    return {
    id: `${tipo}-${str(o.stream_id ?? o.series_id ?? o.id ?? i)}`,
    nome: str(o.name ?? o.nome ?? o.title) || 'Sem nome',
    url: str(o.stream_url ?? o.url ?? o.link),
    img: str(o.stream_icon ?? o.cover ?? o.icon ?? o.logo ?? o.img) || undefined,
    cat: str(o.category_name ?? o.categoria ?? o.group) || undefined,
    nota: r > 0 ? Math.min(5, r) : undefined,
    sinopse: str(o.plot ?? o.sinopse ?? o.description) || undefined,
    elenco: str(o.cast ?? o.elenco) || undefined,
    duracao: str(o.duration ?? o.duracao ?? o.runtime) || undefined,
    qualidade: str(o.quality ?? o.qualidade) || undefined,
    ano: str(o.year ?? o.ano ?? o.releaseDate) || undefined,
    temps: ts.length ? ts : undefined,
    }
  })
}

export async function buscar(c: Cred): Promise<Dados> {
  const r = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(c),
  })
  const txt = await r.text()
  if (!r.ok) throw new Error(`Erro ${r.status}: ${txt.slice(0, 200)}`)
  let j: Record<string, unknown>
  try {
    const p = JSON.parse(txt) as unknown
    j = Array.isArray(p) ? { canais: p } : (p as Record<string, unknown>)
  } catch {
    if (!txt.includes('#EXTINF')) throw new Error('Resposta inválida: ' + txt.slice(0, 200))
    const d: Dados = { tv: [], filmes: [], series: [] }
    const ls = txt.split(/\r?\n/)
    ls.forEach((l, i) => {
      if (!l.startsWith('#EXTINF')) return
      const u = (ls.slice(i + 1).find((x) => x.trim() && !x.startsWith('#')) ?? '').trim()
      if (!u) return
      const g = /group-title="([^"]*)"/.exec(l)?.[1]
      const img = /tvg-logo="([^"]*)"/.exec(l)?.[1]
      const it: Item = { id: `m-${i}`, nome: l.split(',').pop()?.trim() || 'Sem nome', url: u, img: img || undefined, cat: g }
      if (u.includes('/movie/')) d.filmes.push(it)
      else if (u.includes('/series/')) d.series.push(it)
      else d.tv.push(it)
    })
    return d
  }
  if (j.error || j.erro) throw new Error(str(j.error ?? j.erro) || 'Erro do proxy')
  return {
    tv: norm(j.canais ?? j.live ?? j.tv, 'tv'),
    filmes: norm(j.filmes ?? j.movies ?? j.vod, 'filmes'),
    series: norm(j.series ?? j.séries, 'series'),
  }
}

export const lerDados = (): Dados | null => {
  try { return JSON.parse(localStorage.getItem('dc_dados') ?? 'null') } catch { return null }
}
