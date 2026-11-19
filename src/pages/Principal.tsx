import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Settings, User, X } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const abas = [
  { id: 'tv', nome: '📡 TV AO-VIVO' },
  { id: 'filmes', nome: '🎬 FILMES' },
  { id: 'series', nome: '🎭 SÉRIES' },
  { id: 'adulto', nome: '🔞 +18' },
]
const cores = ['from-fuchsia-600 to-indigo-700', 'from-amber-500 to-rose-600', 'from-emerald-500 to-teal-700', 'from-sky-500 to-blue-700', 'from-orange-500 to-pink-600', 'from-violet-600 to-purple-800']
const itens: Record<string, string[]> = {
  tv: ['Canal Esportes 1', 'Canal Notícias', 'Canal Filmes HD', 'Canal Kids', 'Canal Música', 'Canal Documentários'],
  filmes: ['Lançamento: Noite Escura', 'Popular: Velocidade Máxima', 'Ação: Ponto Final', 'Comédia: Férias Malucas', 'Drama: Último Verão', 'Terror: A Casa'],
  series: ['Série Nova: Código Azul', 'T2 · Reino Perdido', 'T1 · Os Herdeiros', 'T3 · Cidade Alta', 'T1 · Fronteira', 'T4 · Sombras'],
  adulto: ['Conteúdo +18 A', 'Conteúdo +18 B', 'Conteúdo +18 C'],
}

const canais = [
  { n: 'Esportes 1', c: 'Esportes', p: ['Futebol ao vivo', 'Melhores Momentos', 'Debate Esportivo'] },
  { n: 'Notícias 24h', c: 'Notícias', p: ['Jornal da Hora', 'Mundo Hoje', 'Economia'] },
  { n: 'Filmes HD', c: 'Filmes', p: ['Noite Escura', 'Ponto Final', 'Férias Malucas'] },
  { n: 'Kids', c: 'Infantil', p: ['Aventuras Kids', 'Desenho Animado', 'Hora da História'] },
  { n: 'Música', c: 'Música', p: ['Top Hits', 'Clipes Pop', 'Show Acústico'] },
  { n: 'Documentários', c: 'Documentários', p: ['Planeta Vivo', 'Grandes Mistérios', 'Oceanos'] },
]
const horas = ['Agora', '+30 min', '+1h']

function Carrossel({ titulo, lista, onPlay }: { titulo: string; lista: string[]; onPlay: (n: string) => void }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-lg font-bold">{titulo}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {lista.map((n, i) => (
          <button key={n} onClick={() => onPlay(n)} className="w-40 shrink-0 text-left sm:w-48">
            <div className={`flex aspect-[2/3] items-end rounded-lg bg-gradient-to-br p-2 text-sm font-semibold ${cores[i % 6]}`}>{n}</div>
          </button>
        ))}
      </div>
    </section>
  )
}

export default function Principal() {
  const [cat, setCat] = useState('Todos')
  const [aba, setAba] = useState('tv')
  const [busca, setBusca] = useState('')
  const [mostraBusca, setMostraBusca] = useState(false)
  const [liberado, setLiberado] = useState(false)
  const [pin, setPin] = useState('')
  const [player, setPlayer] = useState<string | null>(null)
  const lista = itens[aba].filter((i) => i.toLowerCase().includes(busca.toLowerCase()))
  const bloqueado = aba === 'adulto' && !liberado

  const verificaPin = () => {
    const salvo = localStorage.getItem('pin') ?? '0000'
    if (pin === salvo) { setLiberado(true); setPin('') } else toast.error('PIN incorreto')
  }

  return (
    <div className="min-h-svh bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/95 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-bold">🎬 DU CRAZY PLAY</span>
          <div className="flex items-center gap-2">
            {mostraBusca && <Input autoFocus value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, ator, gênero, ano" className="h-8 w-40 border-white/10 sm:w-64" />}
            <button aria-label="Buscar" onClick={() => setMostraBusca(!mostraBusca)}><Search className="size-5" /></button>
            <Link to="/config" aria-label="Configurações"><Settings className="size-5" /></Link>
            <Link to="/entrar" aria-label="Conta"><User className="size-5" /></Link>
          </div>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto">
          {abas.map((a) => (
            <button key={a.id} onClick={() => setAba(a.id)} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${aba === a.id ? 'bg-white text-black' : 'bg-white/10'}`}>{a.nome}</button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <p className="mb-4 rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-300">⏱️ Seu teste grátis expira em: 2h 59min restantes</p>
        <p className="mb-4 text-sm text-zinc-400">⚠️ Alguns conteúdos podem estar indisponíveis</p>
        {bloqueado ? (
          <div className="mx-auto max-w-xs space-y-3 text-center">
            <p>🔞 Digite o PIN para acessar</p>
            <Input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} className="border-white/10 text-center" />
            <Button onClick={verificaPin} className="w-full">Liberar</Button>
          </div>
        ) : (
          aba === 'tv' ? (
            <div>
              <div className="mb-4 flex gap-2 overflow-x-auto">
                {['Todos', ...canais.map((c) => c.c)].map((c) => (
                  <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded px-3 py-1 text-sm ${cat === c ? 'bg-yellow-400 text-black' : 'bg-white/10'}`}>{c}</button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[640px] space-y-2">
                  <div className="grid grid-cols-[140px_repeat(3,1fr)] gap-2 text-xs text-zinc-400">
                    <span />{horas.map((h) => <span key={h}>{h}</span>)}
                  </div>
                  {canais.filter((c) => (cat === 'Todos' || c.c === cat) && c.n.toLowerCase().includes(busca.toLowerCase())).map((c, i) => (
                    <div key={c.n} className="grid grid-cols-[140px_repeat(3,1fr)] gap-2">
                      <button onClick={() => setPlayer(c.n)} className={`rounded bg-gradient-to-br p-2 text-left text-sm font-bold ${cores[i % 6]}`}>{i + 1} · {c.n}</button>
                      {c.p.map((p, j) => (
                        <button key={p} onClick={() => setPlayer(`${c.n} — ${p}`)} className={`truncate rounded bg-white/10 p-2 text-left text-sm hover:bg-white/20 ${j === 0 ? 'border-l-4 border-yellow-400' : ''}`}>{p}</button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <Carrossel titulo="Continue assistindo" lista={lista} onPlay={setPlayer} />
              <Carrossel titulo="Em alta" lista={[...lista].reverse()} onPlay={setPlayer} />
              {lista.length === 0 && <p className="text-zinc-400">Nada encontrado.</p>}
            </div>
          )
        )}
      </main>
      {player && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between p-4">
            <span className="font-semibold">{player}</span>
            <button aria-label="Fechar" onClick={() => setPlayer(null)}><X /></button>
          </div>
          <div className="flex flex-1 items-center justify-center text-zinc-500">▶ Player em tela cheia (demonstração)</div>
        </div>
      )}
    </div>
  )
}
