import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Plus, Trash2 } from "lucide-react";
import type { EmergencyContact } from "@/types/hr";
import { RELATIONSHIP_OPTIONS } from "@/types/hr";
import { formatPhone } from "@/utils/cpfValidation";

interface EmergencyContactsBlockProps {
  contacts: EmergencyContact[];
  onUpdate: (contacts: EmergencyContact[]) => void;
}

export const EmergencyContactsBlock = ({
  contacts,
  onUpdate,
}: EmergencyContactsBlockProps) => {
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    relationship: '',
    phone: '',
  });

  const handleAdd = () => {
    if (!newContact.name?.trim() || !newContact.relationship || !newContact.phone?.trim()) return;

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name.trim(),
      relationship: newContact.relationship,
      phone: newContact.phone,
    };

    onUpdate([...contacts, contact]);
    setNewContact({ name: '', relationship: '', phone: '' });
  };

  const handleRemove = (id: string) => {
    onUpdate(contacts.filter((c) => c.id !== id));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Phone className="h-5 w-5 text-primary" />
          Informações de Contato
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing contacts */}
        {contacts.length > 0 && (
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  <span className="font-medium">{contact.name}</span>
                  <span className="text-muted-foreground">{contact.relationship}</span>
                  <span className="text-muted-foreground">{contact.phone}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(contact.id)}
                  className="ml-2 h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* New contact form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg border">
          <div className="space-y-1">
            <Label className="text-xs">Nome</Label>
            <Input
              placeholder="Nome do contato"
              value={newContact.name || ''}
              onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Grau de Relacionamento</Label>
            <Select
              value={newContact.relationship || ''}
              onValueChange={(v) => setNewContact((p) => ({ ...p, relationship: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Celular</Label>
            <div className="flex gap-2">
              <Input
                placeholder="(00) 9 0000-0000"
                value={newContact.phone || ''}
                onChange={(e) =>
                  setNewContact((p) => ({ ...p, phone: formatPhone(e.target.value) }))
                }
                maxLength={16}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                onClick={handleAdd}
                disabled={!newContact.name?.trim() || !newContact.relationship || !newContact.phone?.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
