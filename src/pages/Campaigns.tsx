import { Plus, Megaphone, MoveHorizontal as MoreHorizontal, Users, MessageSquare, TrendingUp, Play, Pause, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

type CampaignStatus = "ativa" | "pausada" | "rascunho"

interface Campaign {
  id: string
  name: string
  description: string
  status: CampaignStatus
  leads: number
  messages: number
  responseRate: number
  progress: number
  startDate: string
  segment: string
}

const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Prospecção Q2 - SaaS B2B",
    description: "Abordagem focada em CTOs e VPs de Produto de empresas SaaS com 50-200 funcionários",
    status: "ativa",
    leads: 248,
    messages: 1240,
    responseRate: 18,
    progress: 62,
    startDate: "02/04/2026",
    segment: "SaaS / Tech",
  },
  {
    id: "2",
    name: "Enterprise Outbound - Fintech",
    description: "Campanha de ABM para fintechs de médio porte, foco em decisores financeiros",
    status: "ativa",
    leads: 87,
    messages: 435,
    responseRate: 24,
    progress: 41,
    startDate: "15/04/2026",
    segment: "Fintech / Finance",
  },
  {
    id: "3",
    name: "Reativação de Leads Frios",
    description: "Sequência para leads que não responderam nos últimos 60 dias",
    status: "pausada",
    leads: 312,
    messages: 936,
    responseRate: 9,
    progress: 88,
    startDate: "01/03/2026",
    segment: "Todos os segmentos",
  },
  {
    id: "4",
    name: "Webinar Lead Nurturing",
    description: "Sequência de follow-up para leads que assistiram o webinar de Março",
    status: "rascunho",
    leads: 0,
    messages: 0,
    responseRate: 0,
    progress: 0,
    startDate: "—",
    segment: "Eventos / Inbound",
  },
]

const statusConfig: Record<CampaignStatus, { label: string; variant: "default" | "secondary" | "outline"; icon: React.ReactNode }> = {
  ativa: { label: "Ativa", variant: "default", icon: <Play className="size-3" /> },
  pausada: { label: "Pausada", variant: "secondary", icon: <Pause className="size-3" /> },
  rascunho: { label: "Rascunho", variant: "outline", icon: <Clock className="size-3" /> },
}

export function Campaigns() {
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0)
  const totalMessages = campaigns.reduce((sum, c) => sum + c.messages, 0)
  const activeCampaigns = campaigns.filter(c => c.status === "ativa").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Campanhas</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie suas sequências de prospecção</p>
        </div>
        <Button>
          <Plus className="size-4" />
          Nova Campanha
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
                <Megaphone className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeCampaigns}</p>
                <p className="text-xs text-muted-foreground">Campanhas ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-9 rounded-lg bg-sky-500/10">
                <Users className="size-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalLeads.toLocaleString("pt-BR")}</p>
                <p className="text-xs text-muted-foreground">Total de leads impactados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-9 rounded-lg bg-emerald-500/10">
                <MessageSquare className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalMessages.toLocaleString("pt-BR")}</p>
                <p className="text-xs text-muted-foreground">Mensagens enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        {campaigns.map((campaign) => {
          const status = statusConfig[campaign.status]
          return (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{campaign.name}</CardTitle>
                      <Badge variant={status.variant} className="flex items-center gap-1 text-xs">
                        {status.icon}
                        {status.label}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 text-sm">
                      {campaign.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="shrink-0">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar campanha</DropdownMenuItem>
                      <DropdownMenuItem>Ver relatório</DropdownMenuItem>
                      <DropdownMenuItem>Duplicar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {campaign.status === "ativa"
                        ? <DropdownMenuItem>Pausar campanha</DropdownMenuItem>
                        : <DropdownMenuItem>Ativar campanha</DropdownMenuItem>
                      }
                      <DropdownMenuItem variant="destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Segmento</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{campaign.segment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Leads</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{campaign.leads}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mensagens</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{campaign.messages}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Taxa de Resposta</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TrendingUp className="size-3.5 text-emerald-500 shrink-0" />
                      <p className="text-sm font-medium text-foreground">{campaign.responseRate}%</p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {campaign.status !== "rascunho" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Progresso</p>
                      <p className="text-xs font-medium text-foreground">{campaign.progress}%</p>
                    </div>
                    <Progress value={campaign.progress} className="h-1.5" />
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  <span>Iniciada em {campaign.startDate}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
