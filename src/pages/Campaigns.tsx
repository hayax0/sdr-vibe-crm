import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Loader2, Megaphone, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Campaign {
  id: string;
  name: string;
  description: string;
  prompt_persona: string;
}

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    prompt_persona: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: wsData } = await supabase
        .from("workspace_users")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();
      if (wsData) setWorkspaceId(wsData.workspace_id);
    }

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setCampaigns(data);
    setLoading(false);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);

    const { error } = await supabase.from("campaigns").insert([
      {
        workspace_id: workspaceId,
        name: formData.name,
        description: formData.description,
        prompt_persona: formData.prompt_persona,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      alert("Erro ao criar campanha.");
    } else {
      setIsModalOpen(false);
      setFormData({ name: "", description: "", prompt_persona: "" });
      fetchInitialData();
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta campanha?")) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (!error) {
      setCampaigns(campaigns.filter((c) => c.id !== id));
    } else {
      alert("Erro ao excluir campanha.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Campanhas e IA
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure as regras e contextos para geração de mensagens
            automáticas
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4 mr-1" /> Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreateCampaign}>
              <DialogHeader>
                <DialogTitle>Criar Nova Campanha</DialogTitle>
                <DialogDescription>
                  Defina o contexto do produto e as instruções que a IA usará
                  para abordar o lead.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Campanha *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Black Friday 2026"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Contexto da Oferta/Produto *
                  </Label>
                  <textarea
                    id="description"
                    required
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Ex: Estamos oferecendo o SDR Vibe com 50% OFF para os 10 primeiros clientes..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prompt_persona">
                    Tom de Voz e Regras da IA *
                  </Label>
                  <textarea
                    id="prompt_persona"
                    required
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Ex: Aja como um SDR sênior consultivo. Seja amigável, cite a empresa do lead e gere uma mensagem de no máximo 3 parágrafos."
                    value={formData.prompt_persona}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prompt_persona: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || !workspaceId}>
                  {isSubmitting ? "Salvando..." : "Salvar Campanha"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Campanhas */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card/50">
          <Megaphone className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">
            Nenhuma campanha encontrada
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4 text-center max-w-sm">
            Crie sua primeira campanha para começar a gerar mensagens
            personalizadas com Inteligência Artificial.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="group hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Megaphone className="size-5 text-primary" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                  {campaign.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {campaign.description}
                </p>
                <div className="pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                  <span>Pronta para uso</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
