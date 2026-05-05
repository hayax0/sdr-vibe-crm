import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"

export function Login() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-primary-foreground">
            <Zap className="size-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">SDR Vibe</h1>
          <p className="text-sm text-muted-foreground">Mini CRM para equipes de pré-vendas</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Entrar na sua conta</CardTitle>
            <CardDescription>
              Acesse o painel para gerenciar seus leads e campanhas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" size="lg">
              Entrar
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Não tem uma conta?{" "}
              <a href="#" className="text-primary hover:underline font-medium">
                Criar conta
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
