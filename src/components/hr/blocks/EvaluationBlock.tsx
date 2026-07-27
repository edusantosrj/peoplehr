import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Calendar } from "lucide-react";
import type { ProcessEvaluation, ValidationStatus, ProposalStatus, CurrentStage } from "@/types/hr";
import {
  INTERVIEW_STATUS_OPTIONS,
  VALIDATION_STATUS_OPTIONS,
  PROPOSAL_STATUS_OPTIONS,
  CURRENT_STAGE_OPTIONS,
  CURRENT_STAGE_LABELS,
} from "@/types/hr";

interface EvaluationBlockProps {
  evaluation: ProcessEvaluation;
  onUpdate: (field: keyof ProcessEvaluation, value: string | boolean) => void;
}

type FieldDef = {
  key: keyof ProcessEvaluation;
  label: string;
  kind: 'validation' | 'proposal';
};

const evaluationFields: FieldDef[] = [
  { key: 'fichaValidation', label: 'Validação da Ficha', kind: 'validation' },
  { key: 'managementValidation', label: 'Validação da Gerência', kind: 'validation' },
  { key: 'directorValidation', label: 'Validação da Diretoria', kind: 'validation' },
  { key: 'proposalPresented', label: 'Proposta Apresentada', kind: 'proposal' },
  { key: 'proposalAccepted', label: 'Proposta Aceita', kind: 'proposal' },
  { key: 'documentationDelivered', label: 'Documentação Entregue', kind: 'proposal' },
  { key: 'candidateHired', label: 'Contratado', kind: 'proposal' },
];

export const EvaluationBlock = ({ evaluation, onUpdate }: EvaluationBlockProps) => {
  const getValidationColor = (status: string) => {
    switch (status) {
      case 'Aprovada':
        return 'text-green-600';
      case 'Aprovada com Restrição':
        return 'text-amber-600';
      case 'Reprovada':
        return 'text-red-500';
      case 'Iniciada':
        return 'text-blue-600';
      case 'Sim':
        return 'text-green-600';
      case 'Não':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getProposalColor = (status: string) => {
    if (status === 'Sim') return 'text-green-600';
    if (status === 'Não') return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getInterviewColor = (status: string) => {
    switch (status) {
      case 'Agendada':
        return 'text-blue-600 font-medium';
      case 'Compareceu':
        return 'text-green-600 font-medium';
      case 'Reagendada':
        return 'text-amber-600 font-medium';
      case 'Não Compareceu':
      case 'Cancelada':
        return 'text-red-500 font-medium';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleInterviewStatusChange = (newStatus: string) => {
    onUpdate('interviewStatus', newStatus);
    if (newStatus === 'Não Agendada' || newStatus === 'Cancelada') {
      onUpdate('interviewDate', '');
      onUpdate('interviewTime', '');
    }
  };

  const showDateTimeInputs = ['Agendada', 'Reagendada', 'Compareceu', 'Não Compareceu'].includes(
    evaluation.interviewStatus || ''
  );

  // Summary badges (only rendered when applicable, using persisted data)
  const badges: { label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }[] = [];
  if (evaluation.candidateHired === 'Sim') badges.push({ label: 'Contratado', variant: 'default' });
  if (evaluation.talentBank) badges.push({ label: 'Banco de Talentos', variant: 'secondary' });
  if (evaluation.pcd) badges.push({ label: 'PCD', variant: 'secondary' });
  if (evaluation.ns) badges.push({ label: 'N/S', variant: 'secondary' });
  if (evaluation.interviewStatus === 'Agendada') badges.push({ label: 'Entrevista Agendada', variant: 'outline' });
  if (evaluation.interviewStatus === 'Reagendada') badges.push({ label: 'Reagendada', variant: 'outline' });
  if (evaluation.interviewStatus === 'Compareceu') badges.push({ label: 'Compareceu', variant: 'outline' });
  if (evaluation.interviewStatus === 'Não Compareceu') badges.push({ label: 'Não Compareceu', variant: 'destructive' });
  if (evaluation.interviewStatus === 'Cancelada') badges.push({ label: 'Cancelada', variant: 'destructive' });
  if (evaluation.documentationDelivered === 'Sim') badges.push({ label: 'Documentação Entregue', variant: 'outline' });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Avaliação do Processo Seletivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <Badge key={b.label} variant={b.variant || 'secondary'}>{b.label}</Badge>
            ))}
          </div>
        )}

        {/* Fase Atual */}
        <div className="rounded-lg border p-4 bg-muted/30 space-y-1">
          <Label className="text-sm font-medium">Fase Atual</Label>
          <Select
            value={evaluation.currentStage}
            onValueChange={(value) => onUpdate('currentStage', value as CurrentStage)}
          >
            <SelectTrigger className="font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENT_STAGE_OPTIONS.map((stage) => (
                <SelectItem key={stage} value={stage}>{CURRENT_STAGE_LABELS[stage]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Alterar a fase atual não modifica o status das etapas abaixo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluationFields.map(({ key, label, kind }) => {
            const value = evaluation[key] as string;
            const options = kind === 'validation' ? VALIDATION_STATUS_OPTIONS : PROPOSAL_STATUS_OPTIONS;
            const colorFn = kind === 'validation' ? getValidationColor : getProposalColor;
            return (
              <div key={key} className="space-y-1">
                <label className="text-sm text-muted-foreground">{label}</label>
                <Select
                  value={value}
                  onValueChange={(v) => onUpdate(key, v as ValidationStatus | ProposalStatus)}
                >
                  <SelectTrigger className={colorFn(value)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>

        {/* Toggle fields */}
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="pcd" className="text-sm font-medium">PCD</Label>
              <Switch
                id="pcd"
                checked={evaluation.pcd}
                onCheckedChange={(checked) => onUpdate('pcd', checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="talentBank" className="text-sm font-medium">Banco de Talentos</Label>
              <Switch
                id="talentBank"
                checked={evaluation.talentBank}
                onCheckedChange={(checked) => onUpdate('talentBank', checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="ns" className="text-sm font-medium">N/S</Label>
              <Switch
                id="ns"
                checked={evaluation.ns}
                onCheckedChange={(checked) => onUpdate('ns', checked)}
              />
            </div>
          </div>

          {/* Novo Bloco de Entrevista */}
          <div className="rounded-lg border p-4 bg-muted/20 space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Processo de Entrevista
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Status da Entrevista</Label>
                <Select
                  value={evaluation.interviewStatus || 'Não Agendada'}
                  onValueChange={handleInterviewStatusChange}
                >
                  <SelectTrigger className={getInterviewColor(evaluation.interviewStatus || 'Não Agendada')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showDateTimeInputs && (
                <>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Data da Entrevista</Label>
                    <Input
                      type="date"
                      value={evaluation.interviewDate || ''}
                      onChange={(e) => onUpdate('interviewDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Horário da Entrevista</Label>
                    <Input
                      type="time"
                      value={evaluation.interviewTime || ''}
                      onChange={(e) => onUpdate('interviewTime', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium">Observações da Entrevista</Label>
              <Textarea
                placeholder="Anotações ou observações sobre a entrevista..."
                value={evaluation.interviewObservation || ''}
                onChange={(e) => onUpdate('interviewObservation', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

