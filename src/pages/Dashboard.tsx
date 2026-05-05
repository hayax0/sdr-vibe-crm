import { Users, UserCheck, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const metrics = [
  {
    title: "Total de Leads",
    value: "1.284",
    change: "+12%",
    trend: "up",
    description: "em relação ao mês anterior",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Leads Qualificados",
    value: "342",
    change: "+8%",
    trend: "up",
    description: "em relação ao mês anterior",
    icon: UserCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Mensagens Geradas",
    value: "5.891",
    change: "-3%",
    trend: "down",
    description: "em relação ao mês anterior",
    icon: MessageSquare,
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-500/10",
  },
  {
    title: "Taxa de Conversão",
    value: "26,6%",
    change: "+2%",
    trend: "up",
    description: "qualificados / total",
    icon: Target,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
  },
]

const recentActivity = [
  { lead: "Ana Costa", action: "qualificado", time: "há 5 min", company: "TechCorp" },
  { lead: "Bruno Lima", action: "contato iniciado", time: "há 22 min", company: "StartupXYZ" },
  { lead: "Carla Souza", action: "mapeado", time: "há 1h", company: "FinanceHub" },
  { lead: "Diego Ferreira", action: "tentando contato", time: "há 2h", company: "SaaSPlus" },
  { lead: "Elena Matos", action: "qualificado", time: "há 3h", company: "GrowthCo" },
]

const funnelData = [
  { stage: "Base", count: 1284, pct: 100 },
  { stage: "Lead Mapeado", count: 856, pct: 67 },
  { stage: "Tentando Contato", count: 521, pct: 41 },
  { stage: "Conexão Iniciada", count: 389, pct: 30 },
  { stage: "Qualificado", count: 342, pct: 27 },
]

const actionBadgeMap: Record<string, string> = {
  qualificado: "default",
  "contato iniciado": "secondary",
  mapeado: "outline",
  "tentando contato": "secondary",
}

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Visão geral da sua equipe de SDR</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className={`flex items-center justify-center size-9 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`size-5 ${metric.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  metric.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                }`}>
                  {metric.trend === "up"
                    ? <ArrowUpRight className="size-3.5" />
                    : <ArrowDownRight className="size-3.5" />
                  }
                  {metric.change}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.title}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funnel Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Funil de Vendas</CardTitle>
            </div>
            <CardDescription>Distribuição de leads por etapa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnelData.map((item) => (
              <div key={item.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{item.count.toLocaleString("pt-BR")}</span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                      {item.pct}%
                    </Badge>
                  </div>
                </div>
                <Progress value={item.pct} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividade Recente</CardTitle>
            <CardDescription>Últimas atualizações de leads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex items-center justify-center size-8 rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
                  {item.lead.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight truncate">
                    {item.lead}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{item.company}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge
                      variant={actionBadgeMap[item.action] as "default" | "secondary" | "outline" ?? "outline"}
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      {item.action}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
