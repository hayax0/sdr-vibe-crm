import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import {
  Briefcase,
  Building2,
  Check,
  Copy,
  Loader2,
  MoveHorizontal as MoreHorizontal,
  Plus,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  company: string;
  job_title: string;
  status: string;
  phone?: string | null;
  email?: string | null;
  source?: string | null;
  notes?: string | null;
  assigned_to?: string | null;
  custom_data?: Record<string, string>;
}

const columnsDefinition = [
  {
    id: "Base",
    label: "Base",
    color: "bg-muted/50",
    badgeVariant: "outline" as const,
  },
  {
    id: "Lead Mapeado",
    label: "Lead Mapeado",
    color: "bg-sky-500/10",
    badgeVariant: "secondary" as const,
  },
  {
    id: "Tentando Contato",
    label: "Tentando Contato",
    color: "bg-amber-500/10",
    badgeVariant: "secondary" as const,
  },
  {
    id: "Conexão Iniciada",
    label: "Conexão Iniciada",
    color: "bg-emerald-500/10",
    badgeVariant: "default" as const,
  },
  {
    id: "Qualificado",
    label: "Qualificado",
    color: "bg-primary/10",
    badgeVariant: "default" as const,
  },
  {
    id: "Desqualificado",
    label: "Desqualificado",
    color: "bg-red-500/10",
    badgeVariant: "destructive" as const,
  },
  {
    id: "Reunião Agendada",
    label: "Reunião Agendada",
    color: "bg-indigo-500/10",
    badgeVariant: "default" as const,
  },
];

const columnBorderMap: Record<string, string> = {
  Base: "border-t-border",
  "Lead Mapeado": "border-t-sky-400",
  "Tentando Contato": "border-t-amber-400",
  "Conexão Iniciada": "border-t-emerald-500",
  Qualificado: "border-t-primary",
  Desqualificado: "border-t-red-500",
  "Reunião Agendada": "border-t-indigo-500",
};

const avatarColorMap: Record<string, string> = {
  Base: "bg-muted text-muted-foreground",
  "Lead Mapeado": "bg-sky-500/20 text-sky-700 dark:text-sky-400",
  "Tentando Contato": "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  "Conexão Iniciada":
    "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  Qualificado: "bg-primary/20 text-primary",
  Desqualificado: "bg-red-500/20 text-red-500 dark:text-red-400",
  "Reunião Agendada": "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400",
};

const getInitials = (name: string) => {
  if (!name) return "UN";
  const cleanName = name.trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return cleanName.substring(0, 2).toUpperCase();
};

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceUsers, setWorkspaceUsers] = useState<any[]>([]);

  const [customFieldsConfig, setCustomFieldsConfig] = useState<
    { id: string; name: string; type: string }[]
  >([]);

  // Estados do Modal de Criar/Editar Lead
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    company: string;
    job_title: string;
    source: string;
    notes: string;
    assigned_to: string;
    custom_data: Record<string, string>;
  }>({
    name: "",
    email: "",
    phone: "",
    company: "",
    job_title: "",
    source: "",
    notes: "",
    assigned_to: "",
    custom_data: {},
  });

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      job_title: lead.job_title || "",
      source: lead.source || "",
      notes: lead.notes || "",
      assigned_to: lead.assigned_to || "",
      custom_data: lead.custom_data || {},
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      job_title: "",
      source: "",
      notes: "",
      assigned_to: "",
      custom_data: {},
    });
  };

  // Estados do Modal de IA
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const [currentVariationIdx, setCurrentVariationIdx] = useState(0);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userWsId = null;

    if (user) {
      const { data: wsData } = await supabase
        .from("workspace_users")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

      if (wsData) {
        userWsId = wsData.workspace_id;
        setWorkspaceId(userWsId);

        // Fetch users
        const { data: users } = await supabase
          .from("workspace_users")
          .select("user_id")
          .eq("workspace_id", wsData.workspace_id);
        setWorkspaceUsers(users || []);

        // Fetch custom fields config
        const { data: wsInfo } = await supabase
          .from("workspaces")
          .select("custom_fields_config")
          .eq("id", userWsId)
          .single();

        if (wsInfo && wsInfo.custom_fields_config) {
          setCustomFieldsConfig(wsInfo.custom_fields_config);
        }
      }
    }
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setLeads(data);

    const { data: campaignsData } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (campaignsData) setCampaigns(campaignsData);

    setLoading(false);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);

    let error;

    if (editingLead) {
      const { error: updateError } = await supabase
        .from("leads")
        .update({ ...formData })
        .eq("id", editingLead.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("leads")
        .insert([{ workspace_id: workspaceId, ...formData, status: "Base" }]);
      error = insertError;
    }

    setIsSubmitting(false);
    if (!error) {
      handleCloseModal();
      fetchInitialData();
    } else {
      toast.error("Erro ao salvar lead", {
        description: error.message,
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;
    setLeads(leads.filter((lead) => lead.id !== leadId));
    const { error } = await supabase.from("leads").delete().eq("id", leadId);
    if (error) fetchInitialData();
  };

  // Funções de Drag and Drop
  const handleDragStart = (e: React.DragEvent, leadId: string) =>
    e.dataTransfer.setData("leadId", leadId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    const leadToMove = leads.find((l) => l.id === leadId);
    if (!leadToMove || leadToMove.status === newStatus) return;

    // Regra de Validação: Etapas Restritas
    const restrictedStages = [
      "Lead Mapeado",
      "Tentando Contato",
      "Conexão Iniciada",
      "Qualificado",
    ];

    if (restrictedStages.includes(newStatus)) {
      const missingFields = [];
      if (!leadToMove.name?.trim()) missingFields.push("Nome");
      if (!leadToMove.company?.trim()) missingFields.push("Empresa");
      if (!leadToMove.phone?.trim()) missingFields.push("Telefone");
      if (!leadToMove.job_title?.trim()) missingFields.push("Cargo");

      if (missingFields.length > 0) {
        toast.error(`Não é possível mover o lead.`, {
          description: `Preencha os seguintes campos: ${missingFields.join(
            ", "
          )}.`,
        });
        return;
      }
    }

    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );

    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", leadId);

    if (error) fetchInitialData();
  };

  const openAiModal = (lead: Lead) => {
    setSelectedLead(lead);
    setVariations([]);
    setSelectedCampaignId("");
    setIsAiModalOpen(true);
  };

  const generateAIMessage = async () => {
    if (!selectedLead) return;
    if (!selectedCampaignId) {
      toast.error("Por favor, selecione uma campanha.");
      return;
    }
    
    const toastId = toast.loading("Gerando variações de mensagens...");
    try {
      const campaign = campaigns.find((c) => c.id === selectedCampaignId);

      // Chamada para a Edge Function
      const { data, error } = await supabase.functions.invoke(
        "generate-message",
        {
          body: { lead: selectedLead, campaign },
        }
      );

      if (error) throw error;

      setVariations(data.variations || [data.message]);
      setCurrentVariationIdx(0);
      toast.dismiss(toastId);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(
        "Erro ao chamar Edge Function. Certifique-se de ter feito o deploy.",
        { description: err.message }
      );
    }
  };

  const handleSendMessage = async () => {
    if (!selectedLead) return;
    const message = variations[currentVariationIdx];
    await navigator.clipboard.writeText(message);

    toast.success("Copiado! Movendo lead para 'Tentando Contato'...");

    const { error } = await supabase
      .from("leads")
      .update({ status: "Tentando Contato" })
      .eq("id", selectedLead.id);

    if (!error) {
      fetchInitialData();
      setTimeout(() => setIsAiModalOpen(false), 1000);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Funil de Leads
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie o pipeline de prospecção com arrastar e soltar
          </p>
        </div>

        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            if (!open) handleCloseModal();
            else setIsModalOpen(true);
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={() => {
                setEditingLead(null);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  company: "",
                  job_title: "",
                  source: "",
                  notes: "",
                  assigned_to: "",
                  custom_data: {},
                });
              }}
            >
              <Plus className="size-4 mr-1" /> Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <form onSubmit={handleCreateLead}>
              <DialogHeader>
                <DialogTitle>
                  {editingLead ? "Editar Lead" : "Cadastrar Novo Lead"}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="grid gap-4 py-4 px-1">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Empresa</Label>
                      <Input
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cargo</Label>
                      <Input
                        value={formData.job_title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            job_title: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Origem do Lead</Label>
                    <Input
                      value={formData.source}
                      onChange={(e) =>
                        setFormData({ ...formData, source: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dono do Lead (Responsável)</Label>
                    <Select
                      value={formData.assigned_to}
                      onValueChange={(v) =>
                        setFormData({ ...formData, assigned_to: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaceUsers.map((u) => (
                          <SelectItem key={u.user_id} value={u.user_id}>
                            {u.user_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      className="resize-none"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
                  </div>

                  {customFieldsConfig.length > 0 && (
                    <div className="space-y-4 mt-2">
                      <Separator />
                      <h4 className="text-sm font-semibold text-foreground">
                        Campos Personalizados
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {customFieldsConfig.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label>{field.name}</Label>
                            <Input
                              type={field.type === "text" ? "text" : field.type}
                              value={formData.custom_data[field.name] || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  custom_data: {
                                    ...formData.custom_data,
                                    [field.name]: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar Lead"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center items-center h-64 flex-1">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6 flex-1">
          {columnsDefinition.map((col) => {
            const columnLeads = leads.filter((lead) => lead.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col gap-3 w-full"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {col.label}
                    </span>
                    <Badge
                      variant={col.badgeVariant}
                      className="text-xs px-1.5 py-0 h-5 font-normal"
                    >
                      {columnLeads.length}
                    </Badge>
                  </div>
                </div>
                <div
                  className={`rounded-lg border-t-2 ${columnBorderMap[col.id]} ${col.color} p-2 space-y-3 min-h-[200px] transition-colors flex flex-col flex-1`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                    {columnLeads.map((lead) => (
                      <Card
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="group bg-card shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing border-muted/50"
                      >
                        <CardHeader className="p-3 pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex items-center justify-center size-8 rounded-full text-xs font-semibold shrink-0 ${avatarColorMap[col.id]}`}
                              >
                                {getInitials(lead.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {lead.name}
                                </p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 opacity-0 group-hover:opacity-100 shrink-0"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditModal(lead)}
                                  className="cursor-pointer"
                                >
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openAiModal(lead)}
                                  className="text-primary font-medium cursor-pointer"
                                >
                                  <Sparkles className="size-4 mr-2" /> Gerar
                                  IA
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="text-red-600 cursor-pointer"
                                >
                                  Remover
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Building2 className="size-3 shrink-0" />
                            <span className="truncate">{lead.company || "Sem empresa"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Briefcase className="size-3 shrink-0" />
                            <span className="truncate">{lead.job_title || "Sem cargo"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {columnLeads.length === 0 && (
                      <div className="flex-1 flex items-center justify-center min-h-[100px] text-xs text-muted-foreground/60 border-2 border-dashed border-muted-foreground/20 rounded-md pointer-events-none">
                        Arraste para cá
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal IA com Variações */}
      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Sugestão de IA {variations.length > 0 ? `(${currentVariationIdx + 1}/${variations.length})` : ""}
              </span>
              {variations.length > 1 && (
                <div className="flex gap-1 pr-6">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCurrentVariationIdx(
                        Math.max(0, currentVariationIdx - 1)
                      )
                    }
                    disabled={currentVariationIdx === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCurrentVariationIdx(
                        Math.min(variations.length - 1, currentVariationIdx + 1)
                      )
                    }
                    disabled={currentVariationIdx === variations.length - 1}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Selecionar Campanha</Label>
              <div className="flex gap-2">
                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Escolha uma campanha..." />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={generateAIMessage} disabled={!selectedCampaignId}>
                  <Sparkles className="size-4 mr-2" /> Gerar
                </Button>
              </div>
            </div>

            {variations.length > 0 && (
              <div className="relative group">
                <Textarea
                  className="min-h-[220px] resize-none bg-muted/30 text-sm leading-relaxed"
                  value={variations[currentVariationIdx] || ""}
                  readOnly
                />
              </div>
            )}
          </div>
          <DialogFooter className="mt-2">
            <Button onClick={handleSendMessage} className="w-full" disabled={variations.length === 0}>
              <Copy className="size-4 mr-2" /> Copiar e Mover para 'Tentando
              Contato'
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
