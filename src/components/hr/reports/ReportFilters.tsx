import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface ReportFiltersState {
  startDate: Date | undefined;
  endDate: Date | undefined;
  unit: string;
  vacancy: string;
  sector: string;
}

interface ReportFiltersProps {
  filters: ReportFiltersState;
  onFiltersChange: (filters: ReportFiltersState) => void;
  units: string[];
  vacancies: { id: string; name: string }[];
  sectors: string[];
}

export const ReportFilters = ({
  filters,
  onFiltersChange,
  units,
  vacancies,
  sectors,
}: ReportFiltersProps) => {
  const updateFilter = (key: keyof ReportFiltersState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      startDate: undefined,
      endDate: undefined,
      unit: "",
      vacancy: "",
      sector: "",
    });
  };

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.unit ||
    filters.vacancy ||
    filters.sector;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Filtros Globais</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Period - Start Date */}
          <div className="space-y-2">
            <Label>Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate
                    ? format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => updateFilter("startDate", date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Period - End Date */}
          <div className="space-y-2">
            <Label>Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate
                    ? format(filters.endDate, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => updateFilter("endDate", date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Unit Filter */}
          <div className="space-y-2">
            <Label>Unidade</Label>
            <Select
              value={filters.unit}
              onValueChange={(value) => updateFilter("unit", value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vacancy Filter */}
          <div className="space-y-2">
            <Label>Vaga</Label>
            <Select
              value={filters.vacancy}
              onValueChange={(value) => updateFilter("vacancy", value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {vacancies.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sector Filter */}
          <div className="space-y-2">
            <Label>Setor</Label>
            <Select
              value={filters.sector}
              onValueChange={(value) => updateFilter("sector", value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
