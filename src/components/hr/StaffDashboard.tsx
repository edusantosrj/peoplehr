import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Building2,
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";
import type { Vacancy } from "@/types/vacancy";
import { useVacancies } from "@/contexts/VacancyContext";
import { formatWorkHours } from "@/types/vacancy";

interface StaffDashboardProps {
  candidates: Candidate[];
  hrDataMap: Record<string, CandidateHRData>;
  onSelectCandidate?: (candidate: Candidate) => void;
}

interface Employee {
  candidate: Candidate;
  hrData: CandidateHRData;
  vacancy: Vacancy | null;
  vacancyName: string;
  unit: string;
  sector: string;
  workHours: string;
  isPcd: boolean;
}

type SortKey = "name" | "vacancy" | "workHours" | "pcd";
type SortDir = "asc" | "desc";

export const StaffDashboard = ({ candidates, hrDataMap, onSelectCandidate }: StaffDashboardProps) => {
  const { vacancies, units } = useVacancies();
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // All hired employees (excluding terminated) with resolved vacancy + unit info
  const hiredEmployees = useMemo<Employee[]>(() => {
    return candidates
      .filter((candidate) => {
        const hrData = hrDataMap[candidate.id];
        if (!hrData) return false;
        const isHired = hrData.admission?.admissionStatus === "Contratado";
        const isTerminated = hrData.termination?.confirmed === true;
        return isHired && !isTerminated;
      })
      .map((candidate) => {
        const hrData = hrDataMap[candidate.id];
        const vacancy = vacancies.find((v) => v.id === hrData?.admission?.vacancyId) || null;

        // Fallback parsing from "Nome - Turno - Unidade"
        const parts = (hrData.admission?.vacancyDisplay || "").split(" - ").map((p) => p.trim());
        const fallbackName = parts[0] || "";
        const fallbackUnit = parts[2] || "";

        const vacancyName = vacancy?.name || fallbackName || "—";
        const unit = vacancy?.unit || hrData.admission?.storeUnit || fallbackUnit || "—";
        const workHours = vacancy
          ? formatWorkHours(vacancy.workHoursStart, vacancy.workHoursEnd)
          : (hrData.admission?.workHours || "—");
        const isPcd = !!hrData.evaluation?.pcd;
        const sector = vacancy?.sector || "—";

        return { candidate, hrData, vacancy, vacancyName, unit, sector, workHours, isPcd };
      });
  }, [candidates, hrDataMap, vacancies]);

  const availableUnits = useMemo(() => {
    const set = new Set<string>();
    units.forEach((u) => u && set.add(u));
    vacancies.forEach((v) => v.unit && set.add(v.unit));
    hiredEmployees.forEach((e) => e.unit && e.unit !== "—" && set.add(e.unit));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [units, vacancies, hiredEmployees]);

  // Filter by unit: match either the vacancy's unit OR the stored admission unit
  const filteredEmployees = useMemo(() => {
    if (!selectedUnit) return [];
    return hiredEmployees.filter((e) => {
      const vacancyUnit = e.vacancy?.unit;
      const admissionUnit = e.hrData.admission?.storeUnit;
      return vacancyUnit === selectedUnit || admissionUnit === selectedUnit || e.unit === selectedUnit;
    });
  }, [hiredEmployees, selectedUnit]);

  const sortedEmployees = useMemo(() => {
    const arr = [...filteredEmployees];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.candidate.fullName.localeCompare(b.candidate.fullName, "pt-BR");
          break;
        case "vacancy":
          cmp = a.vacancyName.localeCompare(b.vacancyName, "pt-BR");
          break;
        case "workHours":
          cmp = a.workHours.localeCompare(b.workHours, "pt-BR");
          break;
        case "pcd":
          cmp = Number(a.isPcd) - Number(b.isPcd);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filteredEmployees, sortKey, sortDir]);

  const totalEmployees = sortedEmployees.length;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const getInitials = (name: string) =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quadro de Efetivo</h2>
          <p className="text-muted-foreground">
            Visualização de funcionários contratados por unidade
          </p>
        </div>

        {selectedUnit && (
          <Badge variant="secondary" className="text-sm">
            <Users className="h-4 w-4 mr-1" />
            {totalEmployees} funcionário{totalEmployees !== 1 ? "s" : ""} na unidade
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Filtro por Unidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Selecione uma unidade para visualizar o efetivo" />
            </SelectTrigger>
            <SelectContent>
              {availableUnits.length === 0 ? (
                <SelectItem value="_empty" disabled>
                  Nenhuma unidade disponível
                </SelectItem>
              ) : (
                availableUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {!selectedUnit && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Selecione uma unidade acima para visualizar o quadro de efetivo.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedUnit && sortedEmployees.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum funcionário contratado encontrado para a unidade selecionada.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedUnit && sortedEmployees.length > 0 && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => handleSort("name")}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Nome <SortIcon col="name" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => handleSort("vacancy")}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Vaga Contratada <SortIcon col="vacancy" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => handleSort("workHours")}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Horário <SortIcon col="workHours" />
                    </button>
                  </TableHead>
                  <TableHead className="w-24">
                    <button
                      type="button"
                      onClick={() => handleSort("pcd")}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      PCD <SortIcon col="pcd" />
                    </button>
                  </TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEmployees.map((emp) => (
                  <TableRow key={emp.candidate.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={emp.candidate.selfieUrl} alt={emp.candidate.fullName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                          {getInitials(emp.candidate.fullName)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{emp.candidate.fullName}</TableCell>
                    <TableCell>{emp.vacancyName}</TableCell>
                    <TableCell>{emp.workHours}</TableCell>
                    <TableCell>
                      <Badge variant={emp.isPcd ? "default" : "secondary"} className="font-normal">
                        {emp.isPcd ? "Sim" : "Não"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelectCandidate?.(emp.candidate)}
                        title="Visualizar ficha"
                        disabled={!onSelectCandidate}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
