import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Loader2, RefreshCw, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { buscar, lerDados, type Cred, type Item } from '@/lib/iptv'

const abas = [
  { id: 'tv', nome: 'TV ao Vivo', ic: '📡' },
  { id: 'filmes', nome: 'Filmes', ic: '🎬' },
  { id: 'series', nome: 'Séries', ic: '🎭' },
  { id: 'fav', nome: 'Favoritos', ic: '⭐' },
  { id: 'cfg', nome: 'Config.', ic: '⚙️' },
]

export default function Principal() {
  const nav = useNavigate()
  const [dados, setDados] = useState(lerDados())
  const [aba, setAba] = useState('tv')
  const [busca, setBusca] = useState('')
  const [player, setPlayer] = useState<Item | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [favs, setFavs] = useState<string[]>(() => JSON.parse(localStorage.getItem('dc_favs') ?? '[]'))

  useEffect(() => { if (!dados) nav('/entrar') }, [dados, nav])
  useEffect(() => { localStorage.setItem('dc_favs', JSON.stringify(favs)) }, [favs])

  if (!dados) return null
  const todos = [...dados.tv, ...dados.filmes, ...dados.series]
  const base = aba === 'fav' ? todos.filter((i) => favs.includes(i.id)) : aba === 'tv' || aba === 'filmes' || aba === 'series' ? dados[aba] : []
  const lista = base.filter((i) => i.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 300)
  const fav = (id: string) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))

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

  return (
    <div className="min-h-svh bg-zinc-950 pb-20 text-zinc-50">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-zinc-950/95 px-4 py-3">
        <span className="font-bold text-[#8050ff]">🎬 DU CRAZY PLAY</span>
        {aba !== 'cfg' && (
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="absolute left-2 top-2 size-4 text-zinc-500" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar" className="h-8 border-white/10 pl-8" />
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-4">
        {carregando && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#8050ff]" /></div>}
        {aba === 'cfg' ? (
          <div className="mx-auto max-w-sm space-y-3">
            <Button onClick={atualizar} disabled={carregando} className="w-full bg-[#8050ff] hover:bg-[#6a3de8]"><RefreshCw /> Atualizar lista</Button>
            <Button asChild variant="secondary" className="w-full"><Link to="/config">Mais configurações</Link></Button>
            <Button onClick={sair} variant="destructive" className="w-full">Sair</Button>
          </div>
        ) : lista.length === 0 ? (
          <p className="py-10 text-center text-zinc-400">{aba === 'fav' ? 'Nenhum favorito ainda.' : 'Nada encontrado.'}</p>
        ) : (
          <div className={aba === 'tv' ? 'grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6' : 'grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7'}>
            {lista.map((i) => (
              <div key={i.id} className="relative">
                <button onClick={() => (i.url ? setPlayer(i) : toast.error('Sem link de vídeo'))} className={`flex w-full items-end overflow-hidden rounded-lg bg-gradient-to-br from-[#8050ff] to-indigo-900 p-2 text-left text-xs font-semibold ${aba === 'tv' ? 'aspect-video' : 'aspect-[2/3]'}`} style={i.img ? { backgroundImage: `linear-gradient(transparent 40%, #000c), url(${i.img})`, backgroundSize: 'cover' } : undefined}>
                  {i.nome}
                </button>
                <button aria-label="Favoritar" onClick={() => fav(i.id)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1">
                  <Heart className={`size-4 ${favs.includes(i.id) ? 'fill-[#8050ff] text-[#8050ff]' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-white/10 bg-zinc-950">
        {abas.map((a) => (
          <button key={a.id} onClick={() => setAba(a.id)} className={`flex flex-1 flex-col items-center py-2 text-[11px] ${aba === a.id ? 'text-[#8050ff]' : 'text-zinc-400'}`}>
            <span className="text-lg">{a.ic}</span>{a.nome}
          </button>
        ))}
      </nav>
      {player && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between p-4">
            <span className="truncate font-semibold">{player.nome}</span>
            <button aria-label="Fechar" onClick={() => setPlayer(null)}><X /></button>
          </div>
          <video src={player.url} controls autoPlay playsInline className="min-h-0 flex-1 bg-black" onError={() => toast.error('Não foi possível reproduzir')} />
        </div>
      )}
    </div>
  )
}
