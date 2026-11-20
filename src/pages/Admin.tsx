import { useCallback, useEffect, useState } from 'react'
import { acesso } from '@/lib/acesso'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clientes, Relatorio, iniciais, type Cli } from '@/pages/Clientes'

type Srv = { nome: string; dns: string; ativo: boolean }
const abas = ['Visão Geral', 'Servidores', 'Conteúdo (IA)', 'Usuários', 'Relatórios', 'Comunicação']

function Servidores() {
  const [lista, setLista] = useState<Srv[]>([
    { nome: 'Aura Top', dns: 'dgaura.top', ativo: true },
    { nome: 'Renovai', dns: 'renovai.sbs', ativo: true },
    { nome: 'Daily3', dns: 'e.daily3.news/...', ativo: true },
  ])
  const [f, setF] = useState({ nome: '', dns: '', user: '', senha: '' })
  const [ativo, setAtivo] = useState(true)
  const salvar = () => {
    if (!f.nome || !f.dns || !f.user || !f.senha) return toast.error('Preencha todos os campos')
    setLista([...lista, { nome: f.nome, dns: f.dns, ativo }])
    setF({ nome: '', dns: '', user: '', senha: '' })
    toast.success('Servidor salvo (simulação de carregamento)')
  }
  const campo = (k: keyof typeof f, ph: string, type = 'text') => (
    <Input type={type} placeholder={ph} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="border-white/10" />
  )
  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-bold">Adicionar novo servidor</h2>
        {campo('nome', 'Nome de exibição')}{campo('dns', 'DNS / Endereço')}{campo('user', 'Usuário de acesso')}{campo('senha', 'Senha de acesso', 'password')}
        <div className="flex flex-wrap gap-4 text-sm">
          <label><input type="radio" name="t" defaultChecked /> API de Streaming</label>
          <label><input type="radio" name="t" /> Playlist M3U</label>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {['TV ao-vivo', 'Filmes', 'Séries'].map((c) => <label key={c}><input type="checkbox" defaultChecked /> {c}</label>)}
          <label><input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} /> Ativado</label>
        </div>
        <div className="flex gap-2">
          <Button onClick={salvar}>✅ Salvar e carregar agora</Button>
          <Button variant="secondary" onClick={() => setF({ nome: '', dns: '', user: '', senha: '' })}>❌ Cancelar</Button>
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-zinc-400"><tr><th>Nome</th><th>DNS</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>
          {lista.map((s) => (
            <tr key={s.nome} className="border-t border-white/10">
              <td className="py-2">{s.nome}</td><td>{s.dns}</td><td>{s.ativo ? '🟢 Online' : '⚪ Desativado'}</td>
              <td className="space-x-2">
                <button onClick={() => toast('Edição em breve')}>✏️</button>
                <button onClick={() => toast.success('Recarregado')}>🔄</button>
                <button onClick={() => setLista(lista.filter((x) => x !== s))}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type Cli = { email: string; status: string }
function Pedidos() {
  const [cl, setCl] = useState<Cli[]>([])
  const admin = sessionStorage.getItem('dc_admin') || ''
  const carregar = useCallback(() => {
    acesso<{ clientes: Cli[] }>({ acao: 'listar', admin }).then((r) => setCl(r.clientes)).catch((e) => toast.error(e.message))
  }, [admin])
  useEffect(() => { carregar() }, [carregar])
  const mudar = async (email: string, status: string) => {
    try {
      await acesso({ acao: 'status', admin, email, status })
      toast.success('Atualizado')
      carregar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro')
    }
  }
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
      <h2 className="font-bold">Acessos por Gmail</h2>
      {cl.length === 0 && <p className="text-sm text-zinc-400">Nenhum cadastro ainda.</p>}
      {cl.map((c) => (
        <div key={c.email} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 p-3 text-sm">
          <span>{c.email} · {c.status}</span>
          <span className="space-x-2">
            <Button size="sm" onClick={() => mudar(c.email, 'aprovado')}>✅ Aprovar</Button>
            <Button size="sm" variant="secondary" onClick={() => mudar(c.email, 'bloqueado')}>🚫 Bloquear</Button>
          </span>
        </div>
      ))}
    </div>
  )
}

function Usuarios({ l, setL }: { l: Cli[]; setL: (v: Cli[]) => void }) {
  return (
    <div className="space-y-3">
      <Pedidos />
      <Clientes l={l} setL={setL} />
    </div>
  )
}

function Geral({ ir }: { ir: () => void }) {
  const cards = [['👥', '1.240', 'Usuários'], ['📡', '450', 'Canais'], ['🎬', '3.200', 'Filmes'], ['🎭', '286', 'Séries']]
  const srv = [['Aura Top', 'dgaura.top'], ['Renovai', 'renovai.sbs'], ['Daily3', 'daily3.news']]
  return (
    <div className="space-y-4">
      <h2 className="font-bold">📊 Visão geral — hoje</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map(([i, v, l]) => (
          <div key={l} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-xl font-bold">{i} {v}</div><div className="text-xs text-zinc-400">{l}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold">⚡ Servidores conectados</h3>
          <Button size="sm" onClick={ir}>+ Adicionar novo</Button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-400"><tr><th>Nome</th><th>DNS</th><th>Status</th></tr></thead>
          <tbody>{srv.map(([n, d]) => <tr key={n} className="border-t border-white/10"><td className="py-2">{n}</td><td>{d}</td><td>🟢 Ativo</td></tr>)}</tbody>
        </table>
      </div>
      <div className="space-y-1 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
        <h3 className="font-bold">📈 Atividade recente</h3>
        <p>✅ Servidor Daily3 atualizado — há 15 min</p>
        <p>✅ 2 novos usuários hoje</p>
        <p>⚠️ 1 link de filme com falha — verificar</p>
      </div>
    </div>
  )
}

export default function Admin() {
  const [aba, setAba] = useState(0)
  const [msg, setMsg] = useState('')
  const [clis, setClis] = useState<Cli[]>(iniciais)
  const acao = (t: string) => <Button variant="secondary" key={t} onClick={() => toast.success(t + ' iniciado')}>{t}</Button>
  return (
    <div className="min-h-svh bg-zinc-950 px-4 py-6 text-zinc-50">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">🔐 Painel Administrativo</h1>
        <nav className="flex flex-wrap gap-2">
          {abas.map((a, i) => <button key={a} onClick={() => setAba(i)} className={`rounded-full px-4 py-1.5 text-sm ${aba === i ? 'bg-white text-black' : 'bg-white/10'}`}>{a}</button>)}
        </nav>
        {aba === 0 && <Geral ir={() => setAba(1)} />}
        {aba === 1 && <Servidores />}
        {aba === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-300">Última verificação: {new Date().toLocaleString('pt-BR')}<br />📡 Canais: 1.240 · 🎬 Filmes: 5.320 · 🎭 Séries: 860</p>
            <div className="flex flex-wrap gap-2">{['🔄 Verificar agora', '➕ Atualizar apenas novos', '🔗 Reparar links', '⏰ Atualização automática'].map(acao)}</div>
          </div>
        )}
        {aba === 3 && <Usuarios l={clis} setL={setClis} />}
        {aba === 4 && <Relatorio l={clis} />}
        {aba === 5 && (
          <div className="space-y-3">
            <Input placeholder="Mensagem" value={msg} onChange={(e) => setMsg(e.target.value)} className="border-white/10" />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => { toast.success('Notificação enviada'); setMsg('') }}>Enviar a todos</Button>
              <Button variant="secondary" onClick={() => toast.success('Aviso agendado')}>Agendar</Button>
              <Button variant="secondary" onClick={() => toast.success('Mensagem fixada')}>Fixar na tela inicial</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
