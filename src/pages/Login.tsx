import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buscar } from '@/lib/iptv'
import { acesso } from '@/lib/acesso'

export default function Login({ admin = false }: { admin?: boolean }) {
  const nav = useNavigate()
  const [url, setUrl] = useState('')
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [, setConta] = useState(localStorage.getItem('dc_conta') || '')
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [aviso, setAviso] = useState('')

  const gate = async (modo: 'entrar' | 'cadastrar') => {
    setCarregando(true)
    setAviso('')
    try {
      if (modo === 'entrar') {
      }
      const r = await acesso<{ status: string }>({ acao: modo, email, senha: pwd })
      if (r.status === 'aprovado') {
        localStorage.setItem('dc_conta', email)
        setConta(email)
      } else if (r.status === 'bloqueado') setAviso('Seu acesso foi bloqueado pelo administrador.')
      else setAviso('Cadastro enviado. Aguarde o administrador autorizar seu acesso e entre novamente.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro')
    } finally {
      setCarregando(false)
    }
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (admin) {
      setCarregando(true)
      try {
        await acesso({ acao: 'admin', admin: senha })
        sessionStorage.setItem('dc_admin', senha)
        nav('/admin')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro')
      } finally {
        setCarregando(false)
      }
      return
    }
    setCarregando(true)
    try {
      const dados = await buscar({ url, usuario, senha })
      localStorage.setItem('dc_cred', JSON.stringify({ url, usuario, senha }))
      localStorage.setItem('dc_dados', JSON.stringify(dados))
      nav('/app')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível conectar')
    } finally {
      setCarregando(false)
    }
  }

  if (false as boolean) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-zinc-950 px-6 text-zinc-50">
        <form
          onSubmit={(e) => { e.preventDefault(); gate('entrar') }}
          className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/5 p-8"
        >
          <h1 className="text-center text-2xl font-bold">🎬 DU CRAZY PLAY</h1>
          <div className="space-y-2">
            <Label htmlFor="em">📧 Gmail</Label>
            <Input id="em" type="text" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@gmail.com" className="border-white/10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw">🔑 Senha</Label>
            <Input id="pw" type="password" required minLength={6} value={pwd} onChange={(e) => setPwd(e.target.value)} className="border-white/10" />
          </div>
          {aviso && <p className="rounded-md bg-white/10 p-3 text-sm">{aviso}</p>}
          <Button type="submit" disabled={carregando} className="w-full bg-[#8050ff] hover:bg-[#6a3de8]">
            {carregando ? <Loader2 className="animate-spin" /> : 'ENTRAR'}
          </Button>
          <Button type="button" variant="secondary" disabled={carregando} onClick={() => gate('cadastrar')} className="w-full">
            Criar conta
          </Button>
          <p className="border-t border-white/10 pt-4 text-center text-sm">
            🔐 Acesso do Administrador → <Link to="/admin/login" className="underline">Clique aqui</Link>
          </p>
        </form>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-zinc-950 px-6 text-zinc-50">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-center text-2xl font-bold">🎬 DU CRAZY PLAY{admin && ' · Admin'}</h1>
        {!admin && (
          <div className="space-y-2">
            <Label htmlFor="srv">🌐 URL / Portal</Label>
            <Input id="srv" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://servidor:porta" className="border-white/10" />
          </div>
        )}
        {!admin && (
          <div className="space-y-2">
            <Label htmlFor="u">👤 Usuário</Label>
            <Input id="u" required value={usuario} onChange={(e) => setUsuario(e.target.value)} className="border-white/10" />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="s">🔑 Senha</Label>
          <Input id="s" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} className="border-white/10" />
        </div>
        <Button type="submit" disabled={carregando} className="w-full bg-[#8050ff] hover:bg-[#6a3de8]">
          {carregando ? <Loader2 className="animate-spin" /> : 'ENTRAR'}
        </Button>
        {!admin && <p className="text-center text-xs text-zinc-500">Use os dados do seu próprio servidor. O app não traz conteúdo.</p>}
        {!admin && (
          <p className="border-t border-white/10 pt-4 text-center text-sm">
            🔐 Acesso do Administrador → <Link to="/admin/login" className="underline">Clique aqui</Link>
          </p>
        )}
      </form>
    </div>
  )
}
