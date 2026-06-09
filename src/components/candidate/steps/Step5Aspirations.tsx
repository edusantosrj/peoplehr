import { useState, useMemo } from "react";
import { Search, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVacancies } from "@/contexts/VacancyContext";
import { cn } from "@/lib/utils";

const MAX_SELECTIONS = 3;

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
  const [search, setSearch] = useState("");

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseInt(numbers) / 100;
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    onChange("salaryExpectation", formatted);
  };

  // Same data source as before: active only, deduplicated by name, sorted
  const vacancyNames = useMemo(
    () => [...new Set(vacancies.filter((v) => v.status === 'Ativa').map((v) => v.name))].sort(),
    [vacancies],
  );

  // Selected list, preserving slot order (1,2,3) — drives persistence
  const selected = useMemo(
    () => [data.desiredPosition1, data.desiredPosition2, data.desiredPosition3].filter(Boolean),
    [data.desiredPosition1, data.desiredPosition2, data.desiredPosition3],
  );

  const writeSlots = (list: string[]) => {
    const slots = [list[0] || "", list[1] || "", list[2] || ""];
    if (slots[0] !== data.desiredPosition1) onChange("desiredPosition1", slots[0]);
    if (slots[1] !== data.desiredPosition2) onChange("desiredPosition2", slots[1]);
    if (slots[2] !== data.desiredPosition3) onChange("desiredPosition3", slots[2]);
  };

  const toggleVacancy = (name: string) => {
    if (selected.includes(name)) {
      writeSlots(selected.filter((n) => n !== name));
    } else {
      if (selected.length >= MAX_SELECTIONS) return;
      writeSlots([...selected, name]);
    }
  };

  const removeVacancy = (name: string) => writeSlots(selected.filter((n) => n !== name));

  const filteredNames = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vacancyNames;
    return vacancyNames.filter((n) => n.toLowerCase().includes(q));
  }, [vacancyNames, search]);

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