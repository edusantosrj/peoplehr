import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserPlus, Save } from "lucide-react";
import type { Admission } from "@/types/hr";
import { ADMISSION_STATUS_OPTIONS } from "@/types/hr";
import { useVacancies } from "@/contexts/VacancyContext";
import { formatVacancyDisplay, formatSalary } from "@/types/vacancy";

interface AdmissionBlockProps {
  admission: Admission;
  onUpdate: (field: keyof Admission, value: string) => void;
  onSave: () => void;
}

export const AdmissionBlock = ({
  admission,
  onUpdate,
  onSave,
}: AdmissionBlockProps) => {
  const { vacancies } = useVacancies();

  const handleVacancyChange = (vacancyId: string) => {
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    if (vacancy) {
      onUpdate('vacancyId', vacancyId);
      onUpdate('vacancyDisplay', formatVacancyDisplay(vacancy));
      onUpdate('storeUnit', vacancy.unit);
      // Auto-fill salary from vacancy (editable)
      onUpdate('definedSalary', formatSalary(vacancy.grossSalary));
    }
  };

  // Include all vacancies - even inactive ones if already linked to candidate
  const availableVacancies = vacancies.filter(
    (v) => v.status === 'Ativa' || v.id === admission.vacancyId
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="h-5 w-5 text-primary" />
          Admissão do Candidato
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Vaga</Label>
            <Select
              value={admission.vacancyId || ''}
              onValueChange={handleVacancyChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma vaga" />
              </SelectTrigger>
              <SelectContent>
                {availableVacancies.map((vacancy) => (
                  <SelectItem key={vacancy.id} value={vacancy.id}>
                    {formatVacancyDisplay(vacancy)}
                    {vacancy.status === 'Inativa' && ' (Inativa)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status da Admissão</Label>
            <Select
              value={admission.admissionStatus || ''}
              onValueChange={(value) => onUpdate('admissionStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {ADMISSION_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Salário Definido</Label>
            <Input
              type="text"
              placeholder="R$ 0,00"
              value={admission.definedSalary || ''}
              onChange={(e) => onUpdate('definedSalary', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Loja / Unidade</Label>
            <Input
              type="text"
              placeholder="Nome da unidade"
              value={admission.storeUnit || ''}
              onChange={(e) => onUpdate('storeUnit', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Data Prevista de Início</Label>
            <Input
              type="date"
              value={admission.expectedStartDate || ''}
              onChange={(e) => onUpdate('expectedStartDate', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea
            placeholder="Observações sobre a admissão..."
            value={admission.observations || ''}
            onChange={(e) => onUpdate('observations', e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={onSave} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" />
          Salvar Admissão
        </Button>
      </CardContent>
    </Card>
  );
};
