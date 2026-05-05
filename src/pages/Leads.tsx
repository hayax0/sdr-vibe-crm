import { Building2, Briefcase, MoveHorizontal as MoreHorizontal, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Lead {
  id: string
  name: string
  company: string
  role: string
  avatar: string
}

interface KanbanColumn {
  id: string
  label: string
  color: string
  badgeVariant: "default" | "secondary" | "outline" | "destructive"
  leads: Lead[]
}

const columns: KanbanColumn[] = [
  {
    id: "base",
    label: "Base",
    color: "bg-muted",
    badgeVariant: "outline",
    leads: [
      { id: "1", name: "Fernanda Torres", company: "DataStream Inc.", role: "Head de Vendas", avatar: "FT" },
      { id: "2", name: "Gustavo Leal", company: "CloudBase", role: "CTO", avatar: "GL" },
      { id: "3", name: "Helena Rocha", company: "NetSolutions", role: "Diretora de TI", avatar: "HR" },
    ],
  },
  {
    id: "mapeado",
    label: "Lead Mapeado",
    color: "bg-sky-500/10",
    badgeVariant: "secondary",
    leads: [
      { id: "4", name: "Igor Martins", company: "FinTechPro", role: "CEO", avatar: "IM" },
      { id: "5", name: "Juliana Neves", company: "SaaS Capital", role: "VP de Produto", avatar: "JN" },
      { id: "6", name: "Kleber Dias", company: "DigitalOps", role: "Gerente Comercial", avatar: "KD" },
    ],
  },
  {
    id: "tentando",
    label: "Tentando Contato",
    color: "bg-amber-500/10",
    badgeVariant: "secondary",
    leads: [
      { id: "7", name: "Laura Mendes", company: "GrowFast", role: "CMO", avatar: "LM" },
      { id: "8", name: "Marcos Pinto", company: "ScaleUp", role: "Fundador", avatar: "MP" },
    ],
  },
  {
    id: "conexao",
    label: "Conexão Iniciada",
    color: "bg-emerald-500/10",
    badgeVariant: "default",
    leads: [
      { id: "9", name: "Natália Carmo", company: "PlatformX", role: "Diretora Comercial", avatar: "NC" },
      { id: "10", name: "Otávio Ramos", company: "B2B Hub", role: "Gerente de Parcerias", avatar: "OR" },
      { id: "11", name: "Patricia Vieira", company: "LeadGen Co.", role: "VP de Vendas", avatar: "PV" },
    ],
  },
  {
    id: "qualificado",
    label: "Qualificado",
    color: "bg-primary/10",
    badgeVariant: "default",
    leads: [
      { id: "12", name: "Rafael Costa", company: "Enterprise Plus", role: "CRO", avatar: "RC" },
      { id: "13", name: "Sabrina Alves", company: "SalesForce Br", role: "Diretora de Revenue", avatar: "SA" },
    ],
  },
]

const columnBorderMap: Record<string, string> = {
  base: "border-t-border",
  mapeado: "border-t-sky-400",
  tentando: "border-t-amber-400",
  conexao: "border-t-emerald-500",
  qualificado: "border-t-primary",
}

const avatarColorMap: Record<string, string> = {
  base: "bg-muted text-muted-foreground",
  mapeado: "bg-sky-500/20 text-sky-700 dark:text-sky-400",
  tentando: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  conexao: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  qualificado: "bg-primary/20 text-primary",
}

export function Leads() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Funil de Leads</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie o pipeline de prospecção</p>
        </div>
        <Button size="sm">
          <Plus className="size-4" />
          Novo Lead
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex flex-col gap-3 min-w-64 w-64 shrink-0">
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{col.label}</span>
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 font-normal">
                  {col.leads.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon-xs">
                <Plus className="size-3.5" />
              </Button>
            </div>

            {/* Column Body */}
            <ScrollArea className="max-h-[calc(100vh-220px)]">
              <div className={`rounded-lg border-t-2 ${columnBorderMap[col.id]} ${col.color} p-2 space-y-2 min-h-24`}>
                {col.leads.map((lead) => (
                  <Card
                    key={lead.id}
                    className="group bg-background shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                  >
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex items-center justify-center size-8 rounded-full text-xs font-semibold shrink-0 ${avatarColorMap[col.id]}`}
                          >
                            {lead.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground leading-tight truncate">
                              {lead.name}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            >
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                            <DropdownMenuItem>Mover etapa</DropdownMenuItem>
                            <DropdownMenuItem>Gerar mensagem</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive">Remover</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="size-3 shrink-0" />
                        <span className="truncate">{lead.company}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Briefcase className="size-3 shrink-0" />
                        <span className="truncate">{lead.role}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {col.leads.length === 0 && (
                  <div className="flex items-center justify-center h-16 text-xs text-muted-foreground/60 rounded-md border border-dashed">
                    Nenhum lead
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  )
}
