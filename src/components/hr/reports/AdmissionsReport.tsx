import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Building2, Briefcase, FolderKanban } from "lucide-react";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";
import type { Vacancy } from "@/types/vacancy";

interface AdmissionsReportProps {
  candidates: Candidate[];
  hrDataMap: Record<string, CandidateHRData>;
  vacancies: Vacancy[];
}

interface AdmissionStat {
  label: string;
  count: number;
}

export const AdmissionsReport = ({
  candidates,
  hrDataMap,
  vacancies,
}: AdmissionsReportProps) => {
  // Get all hired candidates
  const hiredCandidates = candidates.filter((c) => {
    const hrData = hrDataMap[c.id];
    return hrData?.admission?.admissionStatus === "Contratado";
  });

  // Calculate admissions by unit
  const admissionsByUnit: Record<string, number> = {};
  hiredCandidates.forEach((c) => {
    const hrData = hrDataMap[c.id];
    const unit = hrData?.admission?.storeUnit || "Não especificada";
    admissionsByUnit[unit] = (admissionsByUnit[unit] || 0) + 1;
  });

  // Calculate admissions by vacancy
  const admissionsByVacancy: Record<string, number> = {};
  hiredCandidates.forEach((c) => {
    const hrData = hrDataMap[c.id];
    const vacancyId = hrData?.admission?.vacancyId;
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    const vacancyName = vacancy?.name || hrData?.admission?.vacancyDisplay || "Não especificada";
    admissionsByVacancy[vacancyName] = (admissionsByVacancy[vacancyName] || 0) + 1;
  });

  // Calculate admissions by sector
  const admissionsBySector: Record<string, number> = {};
  hiredCandidates.forEach((c) => {
    const hrData = hrDataMap[c.id];
    const vacancyId = hrData?.admission?.vacancyId;
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    const sector = vacancy?.sector || "Não especificado";
    admissionsBySector[sector] = (admissionsBySector[sector] || 0) + 1;
  });

  const totalAdmissions = hiredCandidates.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Admissões
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Card */}
        <div className="bg-primary/10 rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-primary">{totalAdmissions}</div>
          <div className="text-sm text-muted-foreground">Total de Admissões</div>
        </div>

        {/* Grid with breakdown tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* By Unit */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Por Unidade</h4>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(admissionsByUnit)
                  .sort((a, b) => b[1] - a[1])
                  .map(([unit, count]) => (
                    <TableRow key={unit}>
                      <TableCell className="font-medium">{unit}</TableCell>
                      <TableCell className="text-right">{count}</TableCell>
                    </TableRow>
                  ))}
                {Object.keys(admissionsByUnit).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhuma admissão
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* By Vacancy */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Por Vaga</h4>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vaga</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(admissionsByVacancy)
                  .sort((a, b) => b[1] - a[1])
                  .map(([vacancy, count]) => (
                    <TableRow key={vacancy}>
                      <TableCell className="font-medium">{vacancy}</TableCell>
                      <TableCell className="text-right">{count}</TableCell>
                    </TableRow>
                  ))}
                {Object.keys(admissionsByVacancy).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhuma admissão
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* By Sector */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Por Setor</h4>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setor</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(admissionsBySector)
                  .sort((a, b) => b[1] - a[1])
                  .map(([sector, count]) => (
                    <TableRow key={sector}>
                      <TableCell className="font-medium">{sector}</TableCell>
                      <TableCell className="text-right">{count}</TableCell>
                    </TableRow>
                  ))}
                {Object.keys(admissionsBySector).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhuma admissão
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
