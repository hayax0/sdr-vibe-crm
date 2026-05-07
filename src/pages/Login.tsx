import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase"; // Verifique se este é o caminho correto no seu projeto
import { Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Login() {
  const navigate = useNavigate();

  // Estados do formulário e autenticação
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Controla se estamos na tela de login ou cadastro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função principal de autenticação
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Fluxo de Cadastro
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email,
            password,
          },
        );
        if (authError) throw authError;

        const user = authData.user;

        if (user) {
          // 1. Criar o Workspace para o novo usuário
          const { data: workspaceData, error: workspaceError } = await supabase
            .from("workspaces")
            .insert([{ name: `Workspace de ${email.split("@")[0]}` }])
            .select()
            .single();

          if (workspaceError) throw workspaceError;

          // 2. Vincular o usuário ao workspace recém-criado
          const { error: linkError } = await supabase
            .from("workspace_users")
            .insert([{ workspace_id: workspaceData.id, user_id: user.id }]);

          if (linkError) throw linkError;
        }

        alert("Conta e Workspace criados com sucesso! Redirecionando...");
        navigate("/dashboard");
      } else {
        // Fluxo de Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        navigate("/dashboard");
      }
    } catch (err: any) {
      // Tradução de alguns erros comuns do Supabase para ficar mais amigável
      if (err.message === "Invalid login credentials") {
        setError("Email ou senha incorretos.");
      } else if (err.message === "User already registered") {
        setError("Este email já está cadastrado.");
      } else {
        setError(err.message || "Ocorreu um erro na autenticação.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-primary-foreground">
            <Zap className="size-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            SDR Vibe
          </h1>
          <p className="text-sm text-muted-foreground">
            Mini CRM para equipes de pré-vendas
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">
              {isSignUp ? "Criar nova conta" : "Entrar na sua conta"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Cadastre-se para criar seu workspace"
                : "Acesse o painel para gerenciar seus leads e campanhas"}
            </CardDescription>
          </CardHeader>

          {/* Transformamos o Content e o Footer em um formulário */}
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              {/* Exibição de erros */}
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {!isSignUp && (
                    <a
                      href="#"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Esqueceu a senha?
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Aguarde..." : isSignUp ? "Criar conta" : "Entrar"}
              </Button>

              {/* Botão de alternância (Toggle) */}
              <p className="text-xs text-center text-muted-foreground">
                {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null); // Limpa os erros ao trocar de tela
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isSignUp ? "Fazer login" : "Criar conta"}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
