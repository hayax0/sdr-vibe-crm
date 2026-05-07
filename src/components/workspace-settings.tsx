import { useState, useEffect } from 'react'
import { Settings, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function WorkspaceSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const [fields, setFields] = useState<{ id: string, name: string, type: string }[]>([])
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  
  useEffect(() => {
    if (isOpen) {
      loadConfig()
    }
  }, [isOpen])

  const loadConfig = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data: wsUser } = await supabase.from('workspace_users').select('workspace_id').eq('user_id', user.id).single()
    if (!wsUser) return
    setWorkspaceId(wsUser.workspace_id)
    
    const { data: ws } = await supabase.from('workspaces').select('custom_fields_config').eq('id', wsUser.workspace_id).single()
    if (ws && ws.custom_fields_config) {
      setFields(ws.custom_fields_config)
    }
  }

  const handleAddField = () => {
    setFields([...fields, { id: crypto.randomUUID(), name: '', type: 'text' }])
  }

  const handleSave = async () => {
    if (!workspaceId) return
    
    const validFields = fields.filter(f => f.name.trim() !== '')
    
    const { error } = await supabase.from('workspaces').update({ custom_fields_config: validFields }).eq('id', workspaceId)
    
    if (error) {
      toast.error('Erro ao salvar configurações', { description: error.message })
    } else {
      toast.success('Configurações salvas!')
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="relative flex items-center justify-center size-9 rounded-md hover:bg-accent transition-colors">
          <Settings className="size-4 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações do Workspace</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <h4 className="text-sm font-medium">Campos Personalizados (Leads)</h4>
          {fields.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhum campo personalizado criado.</p>
          )}
          {fields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input 
                placeholder="Nome do Campo (ex: Segmento)" 
                value={field.name}
                onChange={e => {
                  const newFields = [...fields];
                  newFields[idx].name = e.target.value;
                  setFields(newFields);
                }}
              />
              <Button variant="ghost" size="icon" onClick={() => setFields(fields.filter(f => f.id !== field.id))}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={handleAddField} className="w-full">
            <Plus className="size-4 mr-2" /> Adicionar Campo
          </Button>
          <Button onClick={handleSave} className="w-full mt-4">Salvar Configurações</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
