import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login({ admin = false }: { admin?: boolean }) {
  const nav = useNavigate()
  return (
    <div className="flex min-h-svh items-center justify-center bg-zinc-950 px-6 text-zinc-50">
      <form
        onSubmit={(e) => { e.preventDefault(); nav(admin ? '/admin' : '/app') }}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/5 p-8"
      >
        <h1 className="text-center text-2xl font-bold">🎬 DU CRAZY PLAY{admin && ' · Admin'}</h1>
        <div className="space-y-2">
          <Label htmlFor="u">👤 Usuário / E-mail</Label>
          <Input id="u" required className="border-white/10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s">🔑 Senha</Label>
          <Input id="s" type="password" required className="border-white/10" />
        </div>
        {!admin && (
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Lembrar-me</label>
        )}
        <Button type="submit" className="w-full">ENTRAR</Button>
        <button type="button" onClick={() => toast('Fale conosco no WhatsApp: (11) 9 3948-4318')} className="block w-full text-sm text-zinc-400 underline">Esqueci minha senha</button>
        {!admin && (
          <p className="border-t border-white/10 pt-4 text-center text-sm">
            🔐 Acesso do Administrador → <Link to="/admin/login" className="underline">Clique aqui</Link>
          </p>
        )}
      </form>
    </div>
  )
}
