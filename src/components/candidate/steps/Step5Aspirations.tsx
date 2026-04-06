import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVacancies } from "@/contexts/VacancyContext";

interface Step5Props {
  data: {
    salaryExpectation: string;
    immediateStart: boolean;
    availableWeekends: boolean;
    availableHolidays: boolean;
    desiredPosition1: string;
    desiredPosition2: string;
    desiredPosition3: string;
  };
  onChange: (field: string, value: string | boolean) => void;
  errors: Record<string, string>;
}

export function Step5Aspirations({ data, onChange, errors }: Step5Props) {
  const { vacancies } = useVacancies();

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseInt(numbers) / 100;
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    onChange("salaryExpectation", formatted);
  };

  // Use vacancy names from the context
  const vacancyNames = [...new Set(vacancies.map((v) => v.name))].sort();

  const availableForPosition1 = vacancyNames.filter(
    (name) => name !== data.desiredPosition2 && name !== data.desiredPosition3
  );
  const availableForPosition2 = vacancyNames.filter(
    (name) => name !== data.desiredPosition1 && name !== data.desiredPosition3
  );
  const availableForPosition3 = vacancyNames.filter(
    (name) => name !== data.desiredPosition1 && name !== data.desiredPosition2
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Pretensões</h3>
        
        <div className="space-y-2">
          <Label htmlFor="salaryExpectation">Pretensão Salarial *</Label>
          <Input
            id="salaryExpectation"
            value={data.salaryExpectation}
            onChange={handleSalaryChange}
            placeholder="R$ 0,00"
          />
          {errors.salaryExpectation && <p className="text-sm text-destructive">{errors.salaryExpectation}</p>}
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-3">
            <Label>Início Imediato?</Label>
            <RadioGroup
              value={data.immediateStart ? "yes" : "no"}
              onValueChange={(v) => onChange("immediateStart", v === "yes")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="immediate-yes" />
                <Label htmlFor="immediate-yes" className="font-normal cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="immediate-no" />
                <Label htmlFor="immediate-no" className="font-normal cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Disponibilidade Finais de Semana?</Label>
            <RadioGroup
              value={data.availableWeekends ? "yes" : "no"}
              onValueChange={(v) => onChange("availableWeekends", v === "yes")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="weekends-yes" />
                <Label htmlFor="weekends-yes" className="font-normal cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="weekends-no" />
                <Label htmlFor="weekends-no" className="font-normal cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Disponibilidade Feriados?</Label>
            <RadioGroup
              value={data.availableHolidays ? "yes" : "no"}
              onValueChange={(v) => onChange("availableHolidays", v === "yes")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="holidays-yes" />
                <Label htmlFor="holidays-yes" className="font-normal cursor-pointer">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="holidays-no" />
                <Label htmlFor="holidays-no" className="font-normal cursor-pointer">Não</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Vagas Desejadas</h3>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Vaga Desejada 1 *</Label>
            <Select value={data.desiredPosition1} onValueChange={(v) => onChange("desiredPosition1", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {availableForPosition1.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.desiredPosition1 && <p className="text-sm text-destructive">{errors.desiredPosition1}</p>}
          </div>

          <div className="space-y-2">
            <Label>Vaga Desejada 2</Label>
            <Select value={data.desiredPosition2} onValueChange={(v) => onChange("desiredPosition2", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhuma</SelectItem>
                {availableForPosition2.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vaga Desejada 3</Label>
            <Select value={data.desiredPosition3} onValueChange={(v) => onChange("desiredPosition3", v === "__none__" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Nenhuma</SelectItem>
                {availableForPosition3.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}