import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  UserCheck,
  Target,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Clock,
  TrendingUp,
  RefreshCw,
  Dot,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface KpiCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  description: string;
  icon: React.ElementType;
  accentColor: string;
  dotColor: string;
}

interface ActivityItem {
  id: number;
  lead: string;
  company: string;
  action: string;
  actionLabel: string;
  time: string;
  type: "qualified" | "contacted" | "mapped" | "message" | "new";
}

interface FunnelStage {
  stage: string;
  shortLabel: string;
  count: number;
  color: string;
}

interface VolumePoint {
  day: string;
  leads: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mapStatusToActivity = (status: string) => {
  switch (status) {
    case "Qualificado":
      return { type: "qualified" as const, actionLabel: "Qualificado", action: "marcado como Qualificado" };
    case "Conexão Iniciada":
      return { type: "contacted" as const, actionLabel: "Conexão", action: "conexão iniciada" };
    case "Tentando Contato":
      return { type: "message" as const, actionLabel: "Contato", action: "tentando contato" };
    case "Lead Mapeado":
      return { type: "mapped" as const, actionLabel: "Mapeado", action: "lead mapeado" };
    default:
      return { type: "new" as const, actionLabel: "Novo", action: "adicionado à base" };
  }
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return "agora";
  const date = new Date(dateStr);
  const diffInMinutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
  
  if (diffInMinutes < 60) return `há ${Math.max(1, diffInMinutes)} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há ${diffInHours} h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `há ${diffInDays} d`;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

const activityStyles: Record<
  ActivityItem["type"],
  { badge: string; dot: string }
> = {
  qualified: {
    badge:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  message: {
    badge: "bg-primary/10 text-primary border border-primary/20",
    dot: "bg-primary",
  },
  contacted: {
    badge: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    dot: "bg-sky-400",
  },
  new: {
    badge: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
    dot: "bg-zinc-500",
  },
  mapped: {
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dot: "bg-amber-400",
  },
};

// ─── Tooltip customizado para recharts ────────────────────────────────────────

const CustomAreaTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    // bg-popover é o token sólido do shadcn — sem transparência. style zIndex necessário
    // porque classes Tailwind não penetram no contexto SVG/foreignObject do recharts.
    <div
      className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl"
      style={{ zIndex: 50 }}
    >
      <p className="text-xs text-slate-50 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-50">
        {payload[0].value} leads
      </p>
    </div>
  );
};

const CustomDonutTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) => {
  if (!active || !payload?.length) return null;
  return (
    // Posição absolute + transform manual resolve a sobreposição com o label central.
    // wrapperStyle no <Tooltip> posiciona fora do SVG para evitar clip pelo viewBox.
    <div
      className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl"
      style={{ zIndex: 50 }}
    >
      <p className="text-xs text-slate-50 mb-0.5">{payload[0].name}</p>
      <p className="text-sm font-semibold text-slate-50">
        {payload[0].value.toLocaleString("pt-BR")} leads
      </p>
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export function Dashboard() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [qualifiedLeads, setQualifiedLeads] = useState(0);
  const [conversionRate, setConversionRate] = useState("0,0");
  const [activeCampaigns, setActiveCampaigns] = useState(0);

  const [volumeData, setVolumeData] = useState<VolumePoint[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [{ data: leads }, { data: campaigns }] = await Promise.all([
        supabase.from("leads").select("*"),
        supabase.from("campaigns").select("*"),
      ]);

      const leadsData = leads || [];
      const campaignsData = campaigns || [];

      // Métricas
      const total = leadsData.length;
      const qualified = leadsData.filter((l: any) => l.status === "Qualificado").length;
      const rate = total > 0 ? ((qualified / total) * 100).toFixed(1).replace(".", ",") : "0,0";

      setTotalLeads(total);
      setQualifiedLeads(qualified);
      setConversionRate(rate);
      setActiveCampaigns(campaignsData.length);

      // Funil de Vendas
      const stages = [
        { name: "Base", short: "Base", color: "#71717a" },
        { name: "Lead Mapeado", short: "Mapeado", color: "#38bdf8" },
        { name: "Tentando Contato", short: "Contato", color: "#fbbf24" },
        { name: "Conexão Iniciada", short: "Conexão", color: "#34d399" },
        { name: "Qualificado", short: "Qualif.", color: "#a78bfa" },
      ];

      const funnel = stages.map((stage) => ({
        stage: stage.name,
        shortLabel: stage.short,
        count: leadsData.filter((l: any) => l.status === stage.name).length,
        color: stage.color,
      }));
      setFunnelData(funnel);

      // Volume Data (Agrupado por dia - últimos 10 dias de leads)
      const volumeMap: Record<string, number> = {};
      
      const sortedByDate = [...leadsData]
        .filter((l: any) => l.created_at)
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      sortedByDate.forEach((l: any) => {
        const date = new Date(l.created_at);
        const dayStr = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
        volumeMap[dayStr] = (volumeMap[dayStr] || 0) + 1;
      });
      
      const volumeArray = Object.keys(volumeMap)
        .slice(-10)
        .map(day => ({ day, leads: volumeMap[day] }));
      
      setVolumeData(volumeArray.length > 0 ? volumeArray : [{ day: "Hoje", leads: 0 }]);

      // Atividade Recente
      const sortedLeads = [...leadsData].sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentLeads(sortedLeads.slice(0, 5));

    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    toast.success("Dados sincronizados!");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 w-full">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Carregando métricas...</p>
      </div>
    );
  }

  const kpis: KpiCard[] = [
    {
      title: "Total de Leads",
      value: totalLeads.toString(),
      change: "Tempo Real",
      trend: "neutral",
      description: "na sua base",
      icon: Users,
      accentColor: "text-primary",
      dotColor: "bg-primary",
    },
    {
      title: "Leads Qualificados",
      value: qualifiedLeads.toString(),
      change: "Tempo Real",
      trend: "neutral",
      description: "prontos para venda",
      icon: UserCheck,
      accentColor: "text-emerald-400",
      dotColor: "bg-emerald-400",
    },
    {
      title: "Taxa de Conversão",
      value: `${conversionRate}%`,
      change: "Tempo Real",
      trend: "neutral",
      description: "qualificados / total",
      icon: Target,
      accentColor: "text-sky-400",
      dotColor: "bg-sky-400",
    },
    {
      title: "Campanhas Ativas",
      value: activeCampaigns.toString(),
      change: "Tempo Real",
      trend: "neutral",
      description: "rodando agora",
      icon: Megaphone,
      accentColor: "text-amber-400",
      dotColor: "bg-amber-400",
    },
  ];

  const totalFunnel = funnelData.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              SDR Vibe
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Aqui está o resumo da sua operação de prospecção.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="gap-2 shrink-0"
        >
          <RefreshCw
            className={`size-3.5 ${isLoading || isRefreshing ? "animate-spin" : ""}`}
          />
          Sincronizar
        </Button>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.title}
              className="group relative overflow-hidden border-border/60 bg-card transition-all duration-200 hover:border-border hover:shadow-lg hover:shadow-black/10"
            >
              {/* Glow decorativo no hover */}
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${kpi.dotColor}`}
              />

              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center size-8 rounded-lg bg-muted">
                      <Icon className={`size-4 ${kpi.accentColor}`} />
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      kpi.trend === "up"
                        ? "text-emerald-400"
                        : kpi.trend === "down"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="size-3.5" />
                    ) : kpi.trend === "down" ? (
                      <ArrowDownRight className="size-3.5" />
                    ) : null}
                    {kpi.change}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {kpi.value}
                  </p>
                  <p className="text-sm font-medium text-foreground/80">
                    {kpi.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {kpi.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Gráficos ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Gráfico de Área — Volume */}
        <Card className="lg:col-span-3 border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">
                    Volume de Leads
                  </CardTitle>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Novos leads adicionados nos últimos 10 dias
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 h-5 font-normal text-muted-foreground"
              >
                Últimos 10 dias
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pr-3">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={volumeData}
                margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#888888"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  stroke="#888888"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  stroke="#888888"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "hsl(var(--primary))",
                    strokeWidth: 0,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donut Chart — Distribuição do Funil */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Funil de Vendas
            </CardTitle>
            <CardDescription className="text-xs">
              Distribuição por etapa
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pt-2">
            {/* Donut */}
            <div className="relative">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={funnelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="stage"
                    stroke="none"
                  >
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<CustomDonutTooltip />}
                    // wrapperStyle coloca o tooltip fora do SVG, evitando clip
                    // pelo viewBox e sobreposição com o label central do donut.
                    wrapperStyle={{ zIndex: 50, outline: "none" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Label central */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-foreground leading-none">
                  {totalFunnel.toLocaleString("pt-BR")}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  total
                </span>
              </div>
            </div>

            {/* Legenda */}
            <div className="w-full space-y-2">
              {funnelData.map((item) => {
                const pct = Math.round((item.count / totalFunnel) * 100);
                return (
                  <div
                    key={item.stage}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ background: item.color }}
                      />
                      <span className="text-muted-foreground truncate">
                        {item.shortLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-medium text-foreground">
                        {item.count.toLocaleString("pt-BR")}
                      </span>
                      <span className="text-muted-foreground w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Atividade Recente ───────────────────────────────────────────── */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">
                  Atividade Recente
                </CardTitle>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Últimas movimentações no pipeline
              </CardDescription>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Ver tudo
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Linha divisória sutil */}
          <div className="border-t border-border/40 mb-4" />

          <div className="space-y-0">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma atividade recente.</p>
            ) : (
              recentLeads.map((lead, idx) => {
                const activityInfo = mapStatusToActivity(lead.status);
                const styles = activityStyles[activityInfo.type];
                return (
                  <div key={lead.id}>
                    <div className="flex items-center gap-3 py-3 group">
                      {/* Avatar */}
                      <div className="flex items-center justify-center size-8 rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0 group-hover:bg-accent transition-colors">
                        {getInitials(lead.name || "Sem Nome")}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-medium text-foreground">
                            {lead.name || "Lead Desconhecido"}
                          </span>
                          <Dot className="size-3 text-muted-foreground/40 shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">
                            {lead.company || "Empresa Desconhecida"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {activityInfo.action}
                        </p>
                      </div>

                      {/* Badge + Tempo */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}
                        >
                          {activityInfo.actionLabel}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTimeAgo(lead.created_at)}
                        </span>
                      </div>
                    </div>
                    {idx < recentLeads.length - 1 && (
                      <div className="border-t border-border/30 ml-11" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
