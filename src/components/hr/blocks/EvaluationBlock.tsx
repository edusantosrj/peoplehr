import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardCheck } from "lucide-react";
import type { ProcessEvaluation } from "@/types/hr";
import { EVALUATION_STATUS_OPTIONS } from "@/types/hr";

interface EvaluationBlockProps {
  evaluation: ProcessEvaluation;
  onUpdate: (field: keyof ProcessEvaluation, value: string) => void;
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Avaliação do Processo Seletivo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluationFields.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="text-sm text-muted-foreground">{label}</label>
              <Select
                value={evaluation[key]}
                onValueChange={(value) => onUpdate(key, value)}
              >
                <SelectTrigger className={getStatusColor(evaluation[key])}>
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
      </CardContent>
    </Card>
  );
};
