import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserMinus, Building2, FolderKanban, ArrowRightLeft } from "lucide-react";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";
import type { Vacancy } from "@/types/vacancy";

interface TerminationsReportProps {
  candidates: Candidate[];
  hrDataMap: Record<string, CandidateHRData>;
  vacancies: Vacancy[];
}

export const TerminationsReport = ({
  candidates,
  hrDataMap,
  vacancies,
}: TerminationsReportProps) => {
  // Get all terminated candidates
  const terminatedCandidates = candidates.filter((c) => {
    const hrData = hrDataMap[c.id];
    return hrData?.termination?.confirmed === true;
  });

  // Calculate voluntary vs involuntary
  let voluntaryCount = 0;
  let involuntaryCount = 0;
  
  terminatedCandidates.forEach((c) => {
    const hrData = hrDataMap[c.id];
    if (hrData?.termination?.voluntaryTermination) {
      voluntaryCount++;
    } else {
      involuntaryCount++;
    }
  });

  // Calculate terminations by reason
  const terminationsByReason: Record<string, number> = {};
  terminatedCandidates.forEach((c) => {
    const hrData = hrDataMap[c.id];
    const reason = hrData?.termination?.terminationReason || "Não especificado";
    terminationsByReason[reason] = (terminationsByReason[reason] || 0) + 1;
  });

  // Calculate terminations by unit
  const terminationsByUnit: Record<string, number> = {};
  terminatedCandidates.forEach((c) => {
    const hrData = hrDataMap[c.id];
    const unit = hrData?.admission?.storeUnit || "Não especificada";
    terminationsByUnit[unit] = (terminationsByUnit[unit] || 0) + 1;
  });

  // Calculate terminations by sector
  const terminationsBySector: Record<string, number> = {};
  terminatedCandidates.forEach((c) => {
    const hrData = hrDataMap[c.id];
    const vacancyId = hrData?.admission?.vacancyId;
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    const sector = vacancy?.sector || "Não especificado";
    terminationsBySector[sector] = (terminationsBySector[sector] || 0) + 1;
  });

  const totalTerminations = terminatedCandidates.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserMinus className="h-5 w-5" />
          Desligamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-red-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-700">{totalTerminations}</div>
            <div className="text-sm text-red-600">Total de Desligamentos</div>
          </div>
          <div className="bg-orange-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-700">{voluntaryCount}</div>
            <div className="text-sm text-orange-600">Voluntários</div>
          </div>
          <div className="bg-purple-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-700">{involuntaryCount}</div>
            <div className="text-sm text-purple-600">Não Voluntários</div>
          </div>
        </div>

        {/* Grid with breakdown tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* By Reason */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Por Motivo</h4>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(terminationsByReason)
                  .sort((a, b) => b[1] - a[1])
                  .map(([reason, count]) => (
                    <TableRow key={reason}>
                      <TableCell className="font-medium">{reason}</TableCell>
                      <TableCell className="text-right">{count}</TableCell>
                    </TableRow>
                  ))}
                {Object.keys(terminationsByReason).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhum desligamento
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
                {Object.entries(terminationsByUnit)
                  .sort((a, b) => b[1] - a[1])
                  .map(([unit, count]) => (
                    <TableRow key={unit}>
                      <TableCell className="font-medium">{unit}</TableCell>
                      <TableCell className="text-right">{count}</TableCell>
                    </TableRow>
                  ))}
                {Object.keys(terminationsByUnit).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhum desligamento
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
                {Object.entries(terminationsBySector)
                  .sort((a, b) => b[1] - a[1])
                  .map(([sector, count]) => (
                    <TableRow key={sector}>
                      <TableCell className="font-medium">{sector}</TableCell>
                      <TableCell className="text-right">{count}</TableCell>
                    </TableRow>
                  ))}
                {Object.keys(terminationsBySector).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhum desligamento
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
