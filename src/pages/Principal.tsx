import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Loader2, Play, RefreshCw, Search, Star, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { buscar, lerDados, type Cred, type Item } from '@/lib/iptv'

const abas = [
  { id: 'tv', nome: 'TV ao Vivo', ic: '📡' },
  { id: 'filmes', nome: 'Filmes', ic: '🎬' },
  { id: 'series', nome: 'Séries', ic: '🎭' },
  { id: 'fav', nome: 'Favoritos', ic: '⭐' },
  { id: 'hist', nome: 'Histórico', ic: '🕘' },
  { id: 'cfg', nome: 'Config.', ic: '⚙️' },
]

const ler = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? 'null') ?? d } catch { return d } }

function Estrelas({ n }: { n?: number }) {
  if (!n) return <span className="text-[10px] text-zinc-500">Sem nota</span>
  return (
    <span className="flex items-center gap-0.5" aria-label={`Nota ${n.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`size-3 ${n >= s - 0.5 ? 'fill-[#8050ff] text-[#8050ff]' : 'text-zinc-600'}`} />)}
      <span className="ml-1 text-[10px] text-zinc-400">{n.toFixed(1)}</span>
    </span>
  )
}

export default function Principal() {
  const nav = useNavigate()
  const [dados, setDados] = useState(lerDados())
  const [aba, setAba] = useState('tv')
  const [busca, setBusca] = useState('')
  const [player, setPlayer] = useState<{ nome: string; url: string } | null>(null)
  const [det, setDet] = useState<Item | null>(null)
  const [temp, setTemp] = useState(0)
  const [carregando, setCarregando] = useState(false)
  const [cat, setCat] = useState('')
  const [ordem, setOrdem] = useState('az')
  const [bons, setBons] = useState(false)
  const [favs, setFavs] = useState<string[]>(() => ler('dc_favs', []))
  const [hist, setHist] = useState<Item[]>(() => ler('dc_hist', []))

  const [prog, setProg] = useState<Record<string, { t: number; d: number }>>(() => ler('dc_prog', {}))
  const [mais, setMais] = useState(false)
  const [quando, setQuando] = useState<Record<string, number>>(() => ler('dc_quando', {}))
  const [vel, setVel] = useState(1)
  const [trava, setTrava] = useState(false)
  const vref = useRef<HTMLVideoElement>(null)
  useEffect(() => { localStorage.setItem('dc_quando', JSON.stringify(quando)) }, [quando])
  useEffect(() => { if (vref.current) vref.current.playbackRate = vel }, [vel, player])
  useEffect(() => { localStorage.setItem('dc_prog', JSON.stringify(prog)) }, [prog])
  useEffect(() => { if (!dados) nav('/entrar') }, [dados, nav])
  useEffect(() => { localStorage.setItem('dc_favs', JSON.stringify(favs)) }, [favs])
  useEffect(() => { localStorage.setItem('dc_hist', JSON.stringify(hist)) }, [hist])

  if (!dados) return null
  const todos = [...dados.tv, ...dados.filmes, ...dados.series]
  const global = busca.trim().length > 0 && aba !== 'cfg'
  const base = global ? todos : aba === 'fav' ? todos.filter((i) => favs.includes(i.id)) : aba === 'hist' ? hist : aba === 'tv' || aba === 'filmes' || aba === 'series' ? dados[aba] : []
  const especiais = aba === 'series' && !global ? ['🔥 Populares', '🆕 Novos Episódios', '📺 Minhas Séries', '⭐ Favoritos'] : []
  const cats = [...especiais, ...(Array.from(new Set(base.map((i) => i.cat).filter(Boolean))) as string[])]
  const vista = (i: Item) => hist.some((h) => h.id === i.id)
  const okCat = (i: Item) => !cat || (cat === '🔥 Populares' ? (i.nota ?? 0) >= 4 : cat === '🆕 Novos Episódios' ? !vista(i) : cat === '📺 Minhas Séries' ? vista(i) : cat === '⭐ Favoritos' ? favs.includes(i.id) : i.cat === cat)
  const lista = base
    .filter((i) => okCat(i) && (!bons || (i.nota ?? 0) >= 4) && i.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => (aba === 'hist' && !global ? 0 : ordem === 'nota' ? (b.nota ?? 0) - (a.nota ?? 0) : a.nome.localeCompare(b.nome)))
    .slice(0, 300)
  const fav = (id: string) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  const tipo = (i: Item) => i.id.split('-')[0]

  const tocar = (i: Item, nome = i.nome, url = i.url) => {
    if (!url) return toast.error('Sem link de vídeo')
    setHist((h) => [i, ...h.filter((x) => x.id !== i.id)].slice(0, 60))
    setQuando((q) => ({ ...q, [i.id]: Date.now() }))
    setVel(1); setTrava(false)
    setPlayer({ nome, url })
  }
  const abrir = (i: Item) => { if (tipo(i) === 'tv') tocar(i); else { setTemp(0); setMais(false); setDet(i) } }
  const pct = (u: string) => { const p = prog[u]; return p && p.d > 0 ? Math.round((p.t / p.d) * 100) : 0 }

  const atualizar = async () => {
    setCarregando(true)
    try {
      const c = JSON.parse(localStorage.getItem('dc_cred') ?? 'null') as Cred | null
      if (!c) return nav('/entrar')
      const d = await buscar(c)
      localStorage.setItem('dc_dados', JSON.stringify(d))
      setDados(d)
      toast.success('Lista atualizada')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Falha ao atualizar')
    } finally { setCarregando(false) }
  }
  const sair = () => { localStorage.removeItem('dc_cred'); localStorage.removeItem('dc_dados'); nav('/entrar') }
  const vazio = todos.length === 0
  const dataH = (id: string) => {
    const t = quando[id]; if (!t) return ''
    const d = new Date(t), h = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const dia = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(t).setHours(0, 0, 0, 0)) / 864e5)
    return `${dia === 0 ? 'Hoje' : dia === 1 ? 'Ontem' : d.toLocaleDateString('pt-BR')} às ${h}`
  }
  const card = (i: Item) => {
    const tv = tipo(i) === 'tv'
    const p = tipo(i) === 'filmes' ? pct(i.url) : 0
    return (
      <div key={i.id} className="group relative flex flex-col gap-1">
        <button onClick={() => abrir(i)} className={`flex w-full items-end overflow-hidden rounded-lg bg-gradient-to-br from-[#8050ff] to-indigo-950 p-2 text-left text-xs font-semibold ring-[#8050ff] transition hover:ring-2 ${tv ? 'aspect-video' : 'aspect-[2/3]'}`} style={i.img ? { backgroundImage: `linear-gradient(transparent 40%, #000c), url(${i.img})`, backgroundSize: 'cover' } : undefined}>
          <span className="line-clamp-2">{i.nome}</span>
        </button>
        <button aria-label="Favoritar" onClick={() => fav(i.id)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1">
          <Heart className={`size-4 ${favs.includes(i.id) ? 'fill-[#8050ff] text-[#8050ff]' : ''}`} />
        </button>
        {aba === 'hist' && !global ? <span className="text-[10px] text-zinc-400">{dataH(i.id)}{p >= 90 ? ' · ✅ Completo' : p > 0 ? ` · ${p}% visto` : ''}</span> : <Estrelas n={i.nota} />}
        <Button size="sm" onClick={() => abrir(i)} className="h-7 bg-[#8050ff] text-xs hover:bg-[#6a3de8]"><Play className="size-3" />{tv ? 'Assistir' : 'Detalhes'}</Button>
      </div>
    )
  }
  const grupos = [['tv', '📺 Canais Favoritos'], ['filmes', '🎬 Filmes Favoritos'], ['series', '🎭 Séries Favoritas']] as const

  return (
    <div className="min-h-svh bg-zinc-950 pb-20 text-zinc-50">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-zinc-950/95 px-4 py-3">
        <span className="hidden font-bold text-[#8050ff] sm:block">🎬 DU CRAZY PLAY</span>
        {aba !== 'cfg' && (
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="absolute left-2 top-2 size-4 text-zinc-500" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Busca global: canais, filmes, séries" className="h-8 border-white/10 pl-8" />
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-4">
        {carregando && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#8050ff]" /></div>}
        {aba !== 'cfg' && (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <select value={ordem} onChange={(e) => setOrdem(e.target.value)} className="rounded bg-zinc-800 px-2 py-1">
              <option value="az">A–Z</option><option value="nota">Melhor avaliação</option>
            </select>
            <label className="flex items-center gap-1 text-zinc-300"><input type="checkbox" checked={bons} onChange={(e) => setBons(e.target.checked)} /> 4★ ou mais</label>
            {global && <span className="text-[#a070ff]">Resultados em todas as seções</span>}
            {aba === 'hist' && hist.length > 0 && <button onClick={() => setHist([])} className="ml-auto text-zinc-400 underline">Limpar histórico</button>}
          </div>
        )}
        {aba !== 'cfg' && cats.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {['', ...cats.slice(0, 40)].map((c) => (
              <button key={c || 'todas'} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3 py-1 text-xs ${cat === c ? 'bg-[#8050ff] text-white' : 'bg-white/10 text-zinc-300'}`}>{c || 'Todas'}</button>
            ))}
          </div>
        )}
        {aba === 'cfg' ? (
          <div className="mx-auto max-w-sm space-y-3">
            <Button onClick={atualizar} disabled={carregando} className="w-full bg-[#8050ff] hover:bg-[#6a3de8]"><RefreshCw /> Atualizar lista</Button>
            <Button asChild variant="secondary" className="w-full"><Link to="/config">Mais configurações</Link></Button>
            <Button onClick={sair} variant="destructive" className="w-full">Sair</Button>
          </div>
        ) : lista.length === 0 ? (
          <p className="py-10 text-center text-zinc-400">{vazio ? 'O servidor não devolveu conteúdo. Vá em Config. e atualize a lista.' : aba === 'fav' ? 'Nenhum favorito ainda.' : aba === 'hist' ? 'Nada assistido ainda.' : 'Nada encontrado.'}</p>
        ) : aba === 'fav' && !global ? (
          <div className="space-y-5">
            {grupos.map(([t, titulo]) => { const l = lista.filter((i) => tipo(i) === t); return l.length ? (
              <section key={t}><h2 className="mb-2 font-bold">{titulo}</h2><div className={t === 'tv' ? 'grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6' : 'grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7'}>{l.map(card)}</div></section>
            ) : null })}
          </div>
        ) : (
          <div className={aba === 'tv' && !global ? 'grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6' : 'grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7'}>
            {lista.map(card)}
          </div>
        )}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-white/10 bg-zinc-950">
        {abas.map((a) => (
          <button key={a.id} onClick={() => { setAba(a.id); setCat(''); setBusca('') }} className={`flex flex-1 flex-col items-center py-2 text-[10px] ${aba === a.id ? 'text-[#8050ff]' : 'text-zinc-400'}`}>
            <span className="text-lg">{a.ic}</span>{a.nome}
          </button>
        ))}
      </nav>
      {det && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-zinc-950/95 p-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-3 flex items-center justify-between">
              <button onClick={() => setDet(null)} className="text-sm text-[#a080ff]">← Voltar</button>
              <button onClick={() => fav(det.id)} className="flex items-center gap-1 text-sm"><Heart className={`size-4 ${favs.includes(det.id) ? 'fill-[#8050ff] text-[#8050ff]' : ''}`} />Favorito</button>
            </div>
            <div className="flex gap-4">
              <div className="aspect-[2/3] w-32 shrink-0 rounded-lg bg-gradient-to-br from-[#8050ff] to-indigo-950 sm:w-44" style={det.img ? { backgroundImage: `url(${det.img})`, backgroundSize: 'cover' } : undefined} />
              <div className="space-y-2 text-sm">
                <h2 className="text-xl font-bold">{det.nome}</h2>
                <Estrelas n={det.nota} />
                <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
                  {[det.ano, det.duracao, det.qualidade, det.cat].filter(Boolean).map((t) => <span key={t} className="rounded bg-white/10 px-2 py-0.5">{t}</span>)}
                </div>
                {tipo(det) === 'series' && det.temps?.length ? <p className="text-xs text-zinc-300">⭐ {det.nota?.toFixed(1) ?? '—'} • {det.temps.length} Temporadas • {det.temps.reduce((s, t) => s + t.eps.length, 0)} Episódios</p> : null}
                <p className={`text-zinc-300 ${mais ? '' : 'line-clamp-4'}`}><b>Sinopse:</b> {det.sinopse ?? 'Não informada pelo servidor.'}</p>
                {det.sinopse && det.sinopse.length > 200 && <button onClick={() => setMais(!mais)} className="text-xs text-[#a080ff]">{mais ? '[- ver menos]' : '[+ ver mais]'}</button>}
                <p className="text-zinc-300"><b>Elenco:</b> {det.elenco ?? 'Não informado.'}</p>
                <div className="flex gap-2 pt-1">
                  {tipo(det) === 'filmes' && <Button onClick={() => tocar(det)} className="bg-[#8050ff] hover:bg-[#6a3de8]"><Play /> Assistir</Button>}
                  <Button variant="secondary" onClick={() => fav(det.id)}><Heart className={favs.includes(det.id) ? 'fill-[#8050ff] text-[#8050ff]' : ''} />{favs.includes(det.id) ? 'Favoritado' : 'Favoritar'}</Button>
                </div>
              </div>
            </div>
            {tipo(det) === 'series' && (
              <div className="mt-5">
                {det.temps?.length ? (
                  <>
                    <div className="mb-2 flex gap-2 overflow-x-auto">
                      {det.temps.map((t, k) => {
                        const feitos = t.eps.length > 0 && t.eps.every((e) => pct(e.url) >= 90)
                        return <button key={k} onClick={() => setTemp(k)} className={`flex shrink-0 flex-col items-center rounded-lg px-4 py-1 text-xs ${temp === k ? 'bg-[#8050ff]' : 'bg-[#1e1e2f] text-zinc-300'}`}><b>{t.n}</b><span>{feitos ? '✓' : temp === k ? '▶' : ''}</span></button>
                      })}
                    </div>
                    <ul className="space-y-1">
                      {det.temps[temp]?.eps.map((e, j) => (
                        <li key={e.id + j} className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-sm">
                          <span className="min-w-0 flex-1 truncate">{j + 1}. {e.nome} <span className={`ml-1 text-xs ${pct(e.url) >= 90 ? 'text-[#00c851]' : pct(e.url) > 0 ? 'text-[#ffbb33]' : 'text-zinc-400'}`}>{pct(e.url) >= 90 ? '✅ Visto' : pct(e.url) > 0 ? `⏳ ${pct(e.url)}%` : '⏰ Novo'}</span></span>
                          <Button size="sm" onClick={() => tocar(det, `${det.nome} — ${e.nome}`, e.url)} className="h-7 bg-[#8050ff] hover:bg-[#6a3de8]"><Play className="size-3" /> Assistir</Button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : det.url ? (
                  <Button onClick={() => tocar(det)} className="bg-[#8050ff] hover:bg-[#6a3de8]"><Play /> Assistir</Button>
                ) : <p className="text-sm text-zinc-400">O servidor não enviou temporadas e episódios desta série.</p>}
              </div>
            )}
          </div>
        </div>
      )}
      {player && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between p-4">
            <span className="truncate font-semibold">{player.nome}</span>
            <button aria-label="Fechar" onClick={() => setPlayer(null)}><X /></button>
          </div>
          <video ref={vref} src={player.url} controls autoPlay playsInline className={`min-h-0 flex-1 bg-black ${trava ? 'pointer-events-none' : ''}`} onTimeUpdate={(ev) => { const v = ev.currentTarget; if (v.duration && Math.floor(v.currentTime) % 5 === 0) setProg((p) => (p[player.url]?.t === Math.floor(v.currentTime) ? p : { ...p, [player.url]: { t: Math.floor(v.currentTime), d: Math.floor(v.duration) } })) }} onError={() => toast.error('Este conteúdo está temporariamente indisponível.')} />
          <div className="flex items-center justify-between gap-3 p-3 text-sm">
            <label className="flex items-center gap-1">Velocidade
              <select value={vel} onChange={(e) => setVel(Number(e.target.value))} className="rounded bg-zinc-800 px-2 py-1">{[0.5, 0.75, 1, 1.25, 1.5, 2].map((v) => <option key={v} value={v}>{v}x</option>)}</select>
            </label>
            <button onClick={() => setTrava(!trava)} className="text-zinc-300">{trava ? '🔓 Desbloquear toques' : '🔒 Bloquear toques'}</button>
            <button onClick={() => setPlayer(null)} className="text-[#a070ff]">↺ Voltar</button>
          </div>
        </div>
      )}
    </div>
  )
}
