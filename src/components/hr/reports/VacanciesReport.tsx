import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Briefcase, CheckCircle, XCircle, Users, Clock } from "lucide-react";
import type { Vacancy } from "@/types/vacancy";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";
import { formatSalary } from "@/types/vacancy";

interface VacanciesReportProps {
  vacancies: Vacancy[];
  candidates: Candidate[];
  hrDataMap: Record<string, CandidateHRData>;
}

export const VacanciesReport = ({
  vacancies,
  candidates,
  hrDataMap,
}: VacanciesReportProps) => {
  // Calculate vacancy stats
  const totalVacancies = vacancies.length;
  const activeVacancies = vacancies.filter((v) => v.status === "Ativa").length;
  const inactiveVacancies = vacancies.filter((v) => v.status === "Inativa").length;

  // Calculate total positions
  const totalPositions = vacancies.reduce((sum, v) => sum + v.quantity, 0);
  const activePositions = vacancies
    .filter((v) => v.status === "Ativa")
    .reduce((sum, v) => sum + v.quantity, 0);

  // Calculate filled positions (by counting hired candidates per vacancy)
  const filledByVacancy: Record<string, number> = {};
  candidates.forEach((c) => {
    const hrData = hrDataMap[c.id];
    if (hrData?.admission?.admissionStatus === "Contratado" && hrData.admission.vacancyId) {
      const vacancyId = hrData.admission.vacancyId;
      filledByVacancy[vacancyId] = (filledByVacancy[vacancyId] || 0) + 1;
    }
  });

  const totalFilled = Object.values(filledByVacancy).reduce((sum, count) => sum + count, 0);
  const totalOpen = activePositions - totalFilled;

  // Build vacancy list with fill stats
  const vacancyStats = vacancies.map((v) => ({
    ...v,
    filled: filledByVacancy[v.id] || 0,
    open: Math.max(0, v.quantity - (filledByVacancy[v.id] || 0)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Vagas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">{totalVacancies}</div>
            <div className="text-xs text-muted-foreground">Vagas Criadas</div>
          </div>
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-700">{activeVacancies}</div>
            <div className="text-xs text-green-600">Vagas Ativas</div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-700">{inactiveVacancies}</div>
            <div className="text-xs text-gray-600">Vagas Encerradas</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">{totalFilled}</div>
            <div className="text-xs text-blue-600">Posições Preenchidas</div>
          </div>
          <div className="bg-orange-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-700">{Math.max(0, totalOpen)}</div>
            <div className="text-xs text-orange-600">Em Aberto</div>
          </div>
        </div>

        {/* Vacancy List Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaga</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-center">Preenchidas</TableHead>
                <TableHead className="text-center">Em Aberto</TableHead>
                <TableHead className="text-right">Salário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vacancyStats.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.unit}</TableCell>
                  <TableCell>{v.sector}</TableCell>
                  <TableCell className="text-center">
                    {v.status === "Ativa" ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <XCircle className="h-4 w-4" />
                        Inativa
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{v.quantity}</TableCell>
                  <TableCell className="text-center text-green-600">{v.filled}</TableCell>
                  <TableCell className="text-center text-orange-600">
                    {v.status === "Ativa" ? v.open : "—"}
                  </TableCell>
                  <TableCell className="text-right">{formatSalary(v.grossSalary)}</TableCell>
                </TableRow>
              ))}
              {vacancyStats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhuma vaga cadastrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
