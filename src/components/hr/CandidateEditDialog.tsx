import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Loader2, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Candidate, WorkExperience } from "@/types/candidate";
import {
  MARITAL_STATUS_OPTIONS,
  BRAZIL_STATES,
  EDUCATION_LEVELS,
  AVAILABLE_POSITIONS,
} from "@/types/candidate";
import { toProperCase } from "@/utils/textFormatting";

interface CandidateEditDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  candidate: Candidate;
  onSaved: (updated: Candidate) => void;
}

export const CandidateEditDialog = ({ open, onOpenChange, candidate, onSaved }: CandidateEditDialogProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState<Candidate>(candidate);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Candidate>(key: K, value: Candidate[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${candidate.id}/selfie_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('selfies').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('selfies').getPublicUrl(path);
      set('selfieUrl', pub.publicUrl);
      toast({ title: 'Foto atualizada', description: 'A nova foto foi enviada. Clique em Salvar para confirmar.' });
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Não foi possível enviar a foto.', variant: 'destructive' });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    set('workExperiences', form.workExperiences.map((x) => x.id === id ? { ...x, [field]: value } : x));
  };

  const addExperience = () => {
    const e: WorkExperience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      startDate: '',
      currentlyWorking: false,
      referenceName: '',
      referencePhone: '',
    };
    set('workExperiences', [...form.workExperiences, e]);
  };

  const removeExperience = (id: string) =>
    set('workExperiences', form.workExperiences.filter((x) => x.id !== id));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('candidates')
      .update({
        full_name: toProperCase(form.fullName),
        birth_date: form.birthDate,
        marital_status: form.maritalStatus,
        mother_name: toProperCase(form.motherName),
        father_name: form.fatherName ? toProperCase(form.fatherName) : null,
        whatsapp: form.whatsapp,
        instagram: form.instagram || null,
        facebook: form.facebook || null,
        address: toProperCase(form.address),
        address_number: form.addressNumber,
        neighborhood: toProperCase(form.neighborhood),
        city: toProperCase(form.city),
        state: form.state,
        education: form.education,
        course: form.course ? toProperCase(form.course) : null,
        period: form.period || null,
        has_technical_course: form.hasTechnicalCourse,
        completed_courses: form.completedCourses,
        other_courses: form.otherCourses || null,
        has_criminal_record: form.hasCriminalRecord,
        first_job: form.firstJob,
        work_experiences: form.workExperiences as any,
        salary_expectation: form.salaryExpectation,
        immediate_start: form.immediateStart,
        available_weekends: form.availableWeekends,
        available_holidays: form.availableHolidays,
        desired_position_1: form.desiredPosition1,
        desired_position_2: form.desiredPosition2 || null,
        desired_position_3: form.desiredPosition3 || null,
        selfie_url: form.selfieUrl || null,
      })
      .eq('id', candidate.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Ficha atualizada', description: 'Os dados foram salvos com sucesso.' });
    onSaved(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Ficha do Candidato</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={form.selfieUrl || undefined} alt={form.fullName} />
              <AvatarFallback>{form.fullName.charAt(0).toUpperCase() || '—'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoChange} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}>
                {uploadingPhoto ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                {form.selfieUrl ? 'Alterar foto' : 'Adicionar foto'}
              </Button>
              {form.selfieUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={() => set('selfieUrl', undefined)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Remover
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Personal */}
          <div>
            <h3 className="font-semibold mb-3">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nome Completo"><Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} /></Field>
              <Field label="Data de Nascimento (DD/MM/AAAA)"><Input value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} /></Field>
              <Field label="Estado Civil">
                <Select value={form.maritalStatus} onValueChange={(v) => set('maritalStatus', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MARITAL_STATUS_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="WhatsApp"><Input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} /></Field>
              <Field label="Nome da Mãe"><Input value={form.motherName} onChange={(e) => set('motherName', e.target.value)} /></Field>
              <Field label="Nome do Pai"><Input value={form.fatherName || ''} onChange={(e) => set('fatherName', e.target.value)} /></Field>
              <Field label="Instagram"><Input value={form.instagram || ''} onChange={(e) => set('instagram', e.target.value)} /></Field>
              <Field label="Facebook"><Input value={form.facebook || ''} onChange={(e) => set('facebook', e.target.value)} /></Field>
              <ToggleField label="Primeiro Emprego" checked={form.firstJob} onChange={(v) => set('firstJob', v)} />
              <ToggleField label="Possui Antecedentes" checked={form.hasCriminalRecord} onChange={(v) => set('hasCriminalRecord', v)} />
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div>
            <h3 className="font-semibold mb-3">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Endereço"><Input value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
              <Field label="Número"><Input value={form.addressNumber} onChange={(e) => set('addressNumber', e.target.value)} /></Field>
              <Field label="Bairro"><Input value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} /></Field>
              <Field label="Cidade"><Input value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
              <Field label="Estado">
                <Select value={form.state} onValueChange={(v) => set('state', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BRAZIL_STATES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <Separator />

          {/* Education */}
          <div>
            <h3 className="font-semibold mb-3">Escolaridade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Escolaridade">
                <Select value={form.education} onValueChange={(v) => set('education', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EDUCATION_LEVELS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Curso"><Input value={form.course || ''} onChange={(e) => set('course', e.target.value)} /></Field>
              <Field label="Período"><Input value={form.period || ''} onChange={(e) => set('period', e.target.value)} /></Field>
              <ToggleField label="Curso Técnico" checked={form.hasTechnicalCourse} onChange={(v) => set('hasTechnicalCourse', v)} />
              <Field label="Outros Cursos" full>
                <Textarea value={form.otherCourses || ''} onChange={(e) => set('otherCourses', e.target.value)} rows={2} />
              </Field>
            </div>
          </div>

          <Separator />

          {/* Aspirations */}
          <div>
            <h3 className="font-semibold mb-3">Pretensões</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Pretensão Salarial"><Input value={form.salaryExpectation} onChange={(e) => set('salaryExpectation', e.target.value)} /></Field>
              <Field label="Vaga Desejada 1">
                <Select value={form.desiredPosition1} onValueChange={(v) => set('desiredPosition1', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{AVAILABLE_POSITIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Vaga Desejada 2">
                <Select value={form.desiredPosition2 || ''} onValueChange={(v) => set('desiredPosition2', v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{AVAILABLE_POSITIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Vaga Desejada 3">
                <Select value={form.desiredPosition3 || ''} onValueChange={(v) => set('desiredPosition3', v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{AVAILABLE_POSITIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <ToggleField label="Início Imediato" checked={form.immediateStart} onChange={(v) => set('immediateStart', v)} />
              <ToggleField label="Disponível Fins de Semana" checked={form.availableWeekends} onChange={(v) => set('availableWeekends', v)} />
              <ToggleField label="Disponível Feriados" checked={form.availableHolidays} onChange={(v) => set('availableHolidays', v)} />
            </div>
          </div>

          <Separator />

          {/* Experience */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Experiências Profissionais</h3>
              <Button type="button" size="sm" variant="outline" onClick={addExperience}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
            <div className="space-y-3">
              {form.workExperiences.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma experiência cadastrada.</p>
              )}
              {form.workExperiences.map((exp) => (
                <div key={exp.id} className="border rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Field label="Empresa"><Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} /></Field>
                    <Field label="Cargo"><Input value={exp.position} onChange={(e) => updateExperience(exp.id, 'position', e.target.value)} /></Field>
                    <Field label="Data Início"><Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} /></Field>
                    <Field label="Data Fim"><Input value={exp.endDate || ''} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} disabled={exp.currentlyWorking} /></Field>
                    <ToggleField label="Trabalha Atualmente" checked={exp.currentlyWorking} onChange={(v) => updateExperience(exp.id, 'currentlyWorking', v)} />
                    <Field label="Motivo da Saída"><Input value={exp.reasonForLeaving || ''} onChange={(e) => updateExperience(exp.id, 'reasonForLeaving', e.target.value)} /></Field>
                    <Field label="Nome da Referência"><Input value={exp.referenceName} onChange={(e) => updateExperience(exp.id, 'referenceName', e.target.value)} /></Field>
                    <Field label="Telefone da Referência"><Input value={exp.referencePhone} onChange={(e) => updateExperience(exp.id, 'referencePhone', e.target.value)} /></Field>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remover
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) => (
  <div className={`space-y-1 ${full ? 'md:col-span-2' : ''}`}>
    <Label className="text-xs">{label}</Label>
    {children}
  </div>
);

const ToggleField = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between rounded-lg border p-2">
    <Label className="text-sm">{label}</Label>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);
