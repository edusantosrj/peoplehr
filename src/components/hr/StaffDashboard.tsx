import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Clock } from "lucide-react";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";
import type { Vacancy } from "@/types/vacancy";
import { useVacancies } from "@/contexts/VacancyContext";
import { formatWorkHours } from "@/types/vacancy";

interface StaffDashboardProps {
  candidates: Candidate[];
  hrDataMap: Record<string, CandidateHRData>;
}

interface Employee {
  candidate: Candidate;
  hrData: CandidateHRData;
  vacancy: Vacancy | null;
}

interface SectorGroup {
  sector: string;
  employees: Employee[];
}

export const StaffDashboard = ({ candidates, hrDataMap }: StaffDashboardProps) => {
  const { vacancies } = useVacancies();
  const [selectedUnit, setSelectedUnit] = useState<string>("");

  // Get all hired employees (Status da Admissão = "Contratado") excluding terminated
  const hiredEmployees = useMemo(() => {
    return candidates
      .filter((candidate) => {
        const hrData = hrDataMap[candidate.id];
        if (!hrData) return false;
        
        // Check if hired
        const isHired = hrData.admission?.admissionStatus === "Contratado";
        
        // Check if terminated (confirmed termination)
        const isTerminated = hrData.termination?.confirmed === true;
        
        return isHired && !isTerminated;
      })
      .map((candidate) => {
        const hrData = hrDataMap[candidate.id];
        const vacancy = vacancies.find((v) => v.id === hrData?.admission?.vacancyId) || null;
        return { candidate, hrData, vacancy };
      });
  }, [candidates, hrDataMap, vacancies]);

  // Get unique units from hired employees' admissions
  const availableUnits = useMemo(() => {
    const units = new Set<string>();
    hiredEmployees.forEach(({ hrData }) => {
      if (hrData.admission?.storeUnit) {
        units.add(hrData.admission.storeUnit);
      }
    });
    return Array.from(units).sort();
  }, [hiredEmployees]);

  // Filter employees by selected unit and group by sector
  const sectorGroups = useMemo((): SectorGroup[] => {
    if (!selectedUnit) return [];

    const filteredEmployees = hiredEmployees.filter(
      ({ hrData }) => hrData.admission?.storeUnit === selectedUnit
    );

    // Group by sector
    const groupMap = new Map<string, Employee[]>();
    
    filteredEmployees.forEach((employee) => {
      const sector = employee.vacancy?.sector || "—";
      if (!groupMap.has(sector)) {
        groupMap.set(sector, []);
      }
      groupMap.get(sector)!.push(employee);
    });

    // Sort employees within each sector by name (A-Z)
    groupMap.forEach((employees) => {
      employees.sort((a, b) => 
        a.candidate.fullName.localeCompare(b.candidate.fullName, 'pt-BR')
      );
    });

    // Convert to array and sort sectors alphabetically (A-Z)
    return Array.from(groupMap.entries())
      .map(([sector, employees]) => ({ sector, employees }))
      .sort((a, b) => a.sector.localeCompare(b.sector, 'pt-BR'));
  }, [hiredEmployees, selectedUnit]);

  const totalEmployees = sectorGroups.reduce(
    (sum, group) => sum + group.employees.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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
            {totalEmployees} funcionário{totalEmployees !== 1 ? 's' : ''} na unidade
          </Badge>
        )}
      </div>

      {/* Unit Filter - Required */}
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
                  Nenhuma unidade com funcionários contratados
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

      {/* No Unit Selected Message */}
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

      {/* Empty State - No Employees */}
      {selectedUnit && sectorGroups.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum funcionário contratado encontrado para a unidade selecionada.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sector Cards */}
      {selectedUnit && sectorGroups.length > 0 && (
        <div className="grid gap-6">
          {sectorGroups.map((group) => (
            <Card key={group.sector} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {group.sector}
                  </CardTitle>
                  <Badge variant="outline" className="font-normal">
                    {group.employees.length} funcionário{group.employees.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.employees.map(({ candidate, hrData, vacancy }) => (
                    <EmployeeCard
                      key={candidate.id}
                      candidate={candidate}
                      hrData={hrData}
                      vacancy={vacancy}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

interface EmployeeCardProps {
  candidate: Candidate;
  hrData: CandidateHRData;
  vacancy: Vacancy | null;
}

const EmployeeCard = ({ candidate, hrData, vacancy }: EmployeeCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const workHours = vacancy
    ? formatWorkHours(vacancy.workHoursStart, vacancy.workHoursEnd)
    : "—";

  const vacancyName = hrData.admission?.vacancyDisplay || vacancy?.name || "—";

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
      {/* Photo */}
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage src={candidate.selfieUrl} alt={candidate.fullName} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {getInitials(candidate.fullName)}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Name */}
        <p className="font-medium text-sm text-foreground truncate">
          {candidate.fullName}
        </p>

        {/* Vacancy */}
        <p className="text-xs text-muted-foreground truncate">
          {vacancyName}
        </p>

        {/* Work Hours */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>{workHours}</span>
        </div>
      </div>
    </div>
  );
};
