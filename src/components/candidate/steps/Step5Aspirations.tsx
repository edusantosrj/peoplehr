import { useState, useMemo } from "react";
import { Search, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVacancies } from "@/contexts/VacancyContext";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
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
        <p className="text-sm text-muted-foreground">
          Selecione até {MAX_SELECTIONS} vagas de interesse. Toque para selecionar ou remover.
        </p>

        {!isMobile && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              inputMode="search"
              placeholder="Pesquisar vaga"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        <div className={cn("rounded-md border divide-y", !isMobile && "max-h-80 overflow-y-auto")}>

          {filteredNames.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">Nenhuma vaga encontrada.</p>
          ) : (
            filteredNames.map((name) => {
              const isSelected = selected.includes(name);
              const disabled = !isSelected && selected.length >= MAX_SELECTIONS;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleVacancy(name)}
                  disabled={disabled}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left text-base transition-colors min-h-[44px]",
                    "active:bg-accent/70 hover:bg-accent/40",
                    isSelected && "bg-primary/5",
                    disabled && "opacity-50 cursor-not-allowed",
                  )}
                  aria-pressed={isSelected}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                      isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background",
                    )}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                  </span>
                  <span className="flex-1">{name}</span>
                </button>
              );
            })
          )}
        </div>

        <div className="space-y-2">
          <Label>Vagas Selecionadas ({selected.length}/{MAX_SELECTIONS})</Label>
          {selected.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma vaga selecionada ainda.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map((name) => (
                <Badge
                  key={name}
                  variant="secondary"
                  className="pl-3 pr-1 py-1.5 text-sm gap-1"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => removeVacancy(name)}
                    className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-background/60"
                    aria-label={`Remover ${name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {errors.desiredPosition1 && (
            <p className="text-sm text-destructive">{errors.desiredPosition1}</p>
          )}
        </div>
      </div>
    </div>
  );

}