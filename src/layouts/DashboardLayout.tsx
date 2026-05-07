import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Zap,
  LogOut,
  Bell,
  ChevronDown,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { WorkspaceSettings } from "@/components/workspace-settings"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ─── Constantes ───────────────────────────────────────────────────────────────

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Funil de Leads", to: "/leads", icon: Users },
  { label: "Campanhas", to: "/campaigns", icon: Megaphone },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Gera iniciais a partir de um email ou nome completo.
 *  "joao.silva@empresa.com" → "JS"
 *  "joao@empresa.com"       → "JO"
 */
const getInitialsFromEmail = (email: string): string => {
  const local = email.split("@")[0] // parte antes do @
  const parts = local.split(/[._-]+/).filter(Boolean) // divide por . _ -
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return local.substring(0, 2).toUpperCase()
}

/** Formata o email para exibição: trunca se > 26 chars */
const formatEmail = (email: string): string =>
  email.length > 26 ? `${email.substring(0, 24)}…` : email

// ─── Componente ───────────────────────────────────────────────────────────────

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Lead Caio Fields atualizado", time: "Há 5 minutos" },
    { id: 2, title: "Nova campanha Black Friday ativa", time: "Há 2 horas" },
    { id: 3, title: "Reunião com Google", time: "Amanhã, 10:00" },
  ])

  // Busca o usuário autenticado ao montar o layout
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Sessão expirada ou inexistente — redireciona para login
        navigate("/login", { replace: true })
        return
      }

      setUserEmail(user.email ?? null)
    }

    fetchUser()

    // Ouve mudanças de sessão em tempo real (ex: logout em outra aba)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) navigate("/login", { replace: true })
      },
    )

    return () => listener.subscription.unsubscribe()
  }, [navigate])

  // Faz o logout e redireciona
  const handleSignOut = async () => {
    setIsSigningOut(true)
    setUserEmail(null) // Limpa o estado local de forma síncrona
    await supabase.auth.signOut()
    navigate("/login", { replace: true })
  }

  const initials = userEmail ? getInitialsFromEmail(userEmail) : "…"
  const displayEmail = userEmail ? formatEmail(userEmail) : "Carregando..."

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* ── Logo / Marca ─────────────────────────────────────────────── */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div className="flex items-center gap-2 cursor-default">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground shrink-0">
                    <Zap className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-sm">SDR Vibe</span>
                    <span className="text-xs text-muted-foreground">Mini CRM</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ── Navegação ────────────────────────────────────────────────── */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    {/* Verificação estrita de rota ativa usando useLocation */}
                    <NavLink to={item.to}>
                      {() => {
                        const isActive = location.pathname.startsWith(item.to);
                        return (
                          <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                            <item.icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        )
                      }}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

      </Sidebar>

      {/* ── Conteúdo principal ───────────────────────────────────────── */}
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b bg-background px-4 sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex-1" />
          <ModeToggle />
          <WorkspaceSettings />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex items-center justify-center size-9 rounded-md hover:bg-accent transition-colors outline-none focus:bg-accent">
                <Bell className="size-4 text-muted-foreground" />
                {notifications.length > 0 && (
                  <Badge
                    className="absolute -top-0.5 -right-0.5 size-4 p-0 flex items-center justify-center text-[10px]"
                    variant="destructive"
                  >
                    {notifications.length}
                  </Badge>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="flex flex-col max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-2 py-6 text-sm text-center text-muted-foreground">
                    Não há novas notificações
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="px-2 py-3 text-sm border-b last:border-0 border-muted hover:bg-muted/50 transition-colors cursor-default">
                      <p className="font-medium text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.time}</p>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer justify-center text-destructive focus:text-destructive" 
                    onSelect={(e) => { 
                      e.preventDefault(); 
                      setNotifications([]);
                      toast.success("Notificações limpas com sucesso!"); 
                    }}
                  >
                    Limpar Notificações
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center size-9 rounded-full hover:bg-accent transition-colors outline-none focus:ring-2 focus:ring-ring">
                <Avatar className="size-8 border">
                  <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal flex flex-col">
                <span className="font-medium text-foreground">{initials}</span>
                <span className="text-xs text-muted-foreground truncate">{displayEmail}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 size-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
