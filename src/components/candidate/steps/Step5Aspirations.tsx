import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVacancies } from "@/contexts/VacancyContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface VacancySelectProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  includeNone?: boolean;
  id?: string;
}

function VacancySelect({ value, onChange, options, placeholder, includeNone, id }: VacancySelectProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <select
        id={id}
        value={value || ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(includeNone && v === "__none__" ? "" : v);
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {includeNone && <option value="__none__">Nenhuma</option>}
        {options.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(includeNone && v === "__none__" ? "" : v)}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeNone && <SelectItem value="__none__">Nenhuma</SelectItem>}
        {options.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

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

  // Use vacancy names from the context — active only, deduplicated, sorted
  const vacancyNames = [...new Set(vacancies.filter((v) => v.status === 'Ativa').map((v) => v.name))].sort();

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
            <VacancySelect
              value={data.desiredPosition1}
              onChange={(v) => onChange("desiredPosition1", v)}
              options={availableForPosition1}
              placeholder="Selecione"
            />
            {errors.desiredPosition1 && <p className="text-sm text-destructive">{errors.desiredPosition1}</p>}
          </div>

          <div className="space-y-2">
            <Label>Vaga Desejada 2</Label>
            <VacancySelect
              value={data.desiredPosition2}
              onChange={(v) => onChange("desiredPosition2", v)}
              options={availableForPosition2}
              placeholder="Opcional"
              includeNone
            />
          </div>

          <div className="space-y-2">
            <Label>Vaga Desejada 3</Label>
            <VacancySelect
              value={data.desiredPosition3}
              onChange={(v) => onChange("desiredPosition3", v)}
              options={availableForPosition3}
              placeholder="Opcional"
              includeNone
            />
          </div>
        </div>
      </div>
    </div>
  );
}