import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Cred } from '@/lib/iptv'

function Sec({ t, children }: { t: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-white/10 bg-white/5 p-4"><h2 className="mb-2 font-bold">{t}</h2>{children}</section>
}
const ler = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? 'null') ?? d } catch { return d } }

export default function Config() {
  const nav = useNavigate()
  const [pin, setPin] = useState('')
  const [tema, setTema] = useState(localStorage.getItem('dc_tema') ?? 'escuro')
  const [cor, setCor] = useState(localStorage.getItem('dc_cor') ?? 'roxa')
  const cred = ler<Cred | null>('dc_cred', null)
  const kb = Math.round(['dc_dados', 'dc_hist', 'dc_favs', 'dc_prog'].reduce((s, k) => s + (localStorage.getItem(k)?.length ?? 0), 0) / 1024)
  const radio = (nome: string, v: string, set: (x: string) => void, atual: string, k: string, rot: string) => (
    <label className="mr-4 inline-flex items-center gap-1 text-sm"><input type="radio" name={nome} checked={atual === v} onChange={() => { set(v); localStorage.setItem(k, v) }} />{rot}</label>
  )
  return (
    <div className="min-h-svh bg-zinc-950 px-4 py-6 text-zinc-50">
      <div className="mx-auto max-w-2xl space-y-4">
        <Link to="/app" className="flex items-center gap-2 text-sm text-zinc-400"><ArrowLeft className="size-4" /> Voltar</Link>
        <h1 className="text-2xl font-bold">⚙️ CONFIGURAÇÕES</h1>
        <Sec t="👤 Minha conta">
          <p className="text-sm text-zinc-300">Versão do app: 2.0.0<br />Conexão: 🟢 Online<br />Status: ✅ Ativo</p>
        </Sec>
        <Sec t="📡 Servidor de conteúdo">
          <p className="text-sm text-zinc-300">URL: {cred?.url ?? '—'}<br />Usuário: {cred?.usuario ?? '—'}<br />Senha: {cred ? '•••••••••••' : '—'}</p>
          <div className="mt-2 flex items-center gap-3 text-sm">{cred && <span className="text-[#00c851]">✅ Salvo</span>}<Button size="sm" variant="secondary" onClick={() => nav('/entrar')}>📝 Alterar</Button></div>
        </Sec>
        <Sec t="🔒 Segurança">
          <div className="flex gap-2">
            <Input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} maxLength={4} inputMode="numeric" placeholder="PIN conteúdo +18 (4 dígitos)" className="border-white/10" />
            <Button onClick={() => { if (/^\d{4}$/.test(pin)) { localStorage.setItem('pin', pin); setPin(''); toast.success('PIN salvo') } else toast.error('Use 4 dígitos') }}>Salvar PIN</Button>
          </div>
          <Button variant="destructive" size="sm" className="mt-3" onClick={() => { localStorage.removeItem('dc_cred'); localStorage.removeItem('dc_dados'); nav('/entrar') }}>Sair da conta</Button>
        </Sec>
        <Sec t="🎨 Aparência">
          <div>{radio('tema', 'escuro', setTema, tema, 'dc_tema', 'Tema Escuro')}{radio('tema', 'claro', setTema, tema, 'dc_tema', 'Tema Claro')}</div>
          <div className="mt-1">{radio('cor', 'roxa', setCor, cor, 'dc_cor', 'Cor Roxa')}{radio('cor', 'azul', setCor, cor, 'dc_cor', 'Cor Azul')}</div>
          <p className="mt-1 text-xs text-zinc-500">A preferência é salva; o tema visual completo ainda não é aplicado.</p>
        </Sec>
        <Sec t="💾 Armazenamento">
          <p className="mb-2 text-sm text-zinc-300">Cache usado: {kb} KB</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => { localStorage.removeItem('dc_dados'); toast.success('Cache limpo. Atualize a lista ao voltar.') }}>🗑️ Limpar cache</Button>
            <Button variant="secondary" size="sm" onClick={() => { localStorage.removeItem('dc_hist'); localStorage.removeItem('dc_prog'); localStorage.removeItem('dc_quando'); toast.success('Histórico limpo') }}>Limpar histórico</Button>
          </div>
          <p className="mt-2 text-xs text-zinc-400">Favoritos são mantidos.</p>
        </Sec>
        <Sec t="📄 Sobre">
          <p className="text-sm text-zinc-300">A plataforma é reprodutora e não hospeda conteúdo. A disponibilidade depende dos servidores conectados.</p>
        </Sec>
      </div>
    </div>
  )
}
