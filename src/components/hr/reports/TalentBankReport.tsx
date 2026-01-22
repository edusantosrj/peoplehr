import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";

interface TalentBankReportProps {
  candidates: Candidate[];
  hrDataMap: Record<string, CandidateHRData>;
}

// Mask CPF for privacy: 123.456.789-01 -> 123.***.***-01
const maskCpf = (cpf: string): string => {
  if (!cpf || cpf.length < 11) return cpf;
  const clean = cpf.replace(/\D/g, "");
  return `${clean.slice(0, 3)}.***.***-${clean.slice(-2)}`;
};

export const TalentBankReport = ({
  candidates,
  hrDataMap,
}: TalentBankReportProps) => {
  // Filter candidates available for talent bank:
  // - Not hired (admissionStatus !== "Contratado")
  // - Not terminated
  // - Valid registration
  const talentCandidates = candidates.filter((c) => {
    const hrData = hrDataMap[c.id];
    
    // Exclude hired candidates
    if (hrData?.admission?.admissionStatus === "Contratado") {
      return false;
    }
    
    // Exclude terminated candidates
    if (hrData?.termination?.confirmed) {
      return false;
    }
    
    // Include if has valid LGPD consent
    return c.lgpdConsent;
  });

  // Sort by registration date (most recent first)
  const sortedCandidates = [...talentCandidates].sort((a, b) => {
    return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Banco de Talentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="bg-purple-100 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-700">{sortedCandidates.length}</div>
          <div className="text-sm text-purple-600">Candidatos Disponíveis</div>
        </div>

        {/* Candidates Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Pretensão Salarial</TableHead>
                <TableHead>Vagas Desejadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCandidates.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {c.fullName}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {maskCpf(c.cpf)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(c.registrationDate), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{c.salaryExpectation || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.desiredPosition1 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                          {c.desiredPosition1}
                        </span>
                      )}
                      {c.desiredPosition2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                          {c.desiredPosition2}
                        </span>
                      )}
                      {c.desiredPosition3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                          {c.desiredPosition3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sortedCandidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum candidato no banco de talentos
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
