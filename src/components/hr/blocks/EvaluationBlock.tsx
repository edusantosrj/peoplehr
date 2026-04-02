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
import { ClipboardCheck } from "lucide-react";
import type { ProcessEvaluation } from "@/types/hr";
import { EVALUATION_STATUS_OPTIONS, INTERVIEW_STATUS_OPTIONS } from "@/types/hr";

interface EvaluationBlockProps {
  evaluation: ProcessEvaluation;
  onUpdate: (field: keyof ProcessEvaluation, value: string | boolean) => void;
}

const evaluationFields: { key: keyof ProcessEvaluation; label: string }[] = [
  { key: 'fichaValidation', label: 'Validação da Ficha' },
  { key: 'managementValidation', label: 'Validação da Gerência' },
  { key: 'directorValidation', label: 'Validação da Diretoria' },
  { key: 'proposalPresented', label: 'Proposta Apresentada' },
  { key: 'proposalAccepted', label: 'Proposta Aceita' },
  { key: 'documentationDelivered', label: 'Documentação Entregue' },
  { key: 'candidateHired', label: 'Candidato Contratado' },
];

export const EvaluationBlock = ({
  evaluation,
  onUpdate,
}: EvaluationBlockProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sim':
        return 'text-green-600';
      case 'Não':
        return 'text-red-500';
      default:
        return 'text-yellow-600';
    }
  };

  const getInterviewColor = (status: string) => {
    switch (status) {
      case 'Sim':
        return 'text-green-600';
      case 'Compareceu':
        return 'text-green-600';
      case 'Não Compareceu':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Avaliação do Processo Seletivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluationFields.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="text-sm text-muted-foreground">{label}</label>
              <Select
                value={evaluation[key] as string}
                onValueChange={(value) => onUpdate(key, value)}
              >
                <SelectTrigger className={getStatusColor(evaluation[key] as string)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVALUATION_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Toggle fields */}
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="space-y-1">
              <Label className="text-sm font-medium">Entrevista Agendada</Label>
              <Select
                value={evaluation.interviewStatus || 'Não'}
                onValueChange={(value) => onUpdate('interviewStatus', value)}
              >
                <SelectTrigger className={getInterviewColor(evaluation.interviewStatus || 'Não')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};