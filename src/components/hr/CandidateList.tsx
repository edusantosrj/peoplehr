import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";

interface CandidateListProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  hrDataMap?: Record<string, CandidateHRData>;
}

type SortField = 'fullName' | 'cpf' | 'interviewStatus' | 'desiredPosition1' | 'hired' | 'pcd' | 'ns' | 'registrationDate';
type SortDirection = 'asc' | 'desc' | null;

export const CandidateList = ({
  candidates,
  onSelectCandidate,
  hrDataMap = {},
}: CandidateListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const formatCpf = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortField(null); setSortDirection(null); }
      else setSortDirection('asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-3 w-3 ml-1" />;
    return <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const isHired = (candidateId: string) => hrDataMap[candidateId]?.admission?.admissionStatus === 'Contratado';
  const isPCD = (_candidateId: string) => false;
  const isNS = (candidateId: string) => hrDataMap[candidateId]?.evaluation?.ns || false;
  const getInterviewStatus = (candidateId: string) => hrDataMap[candidateId]?.evaluation?.interviewStatus || 'Não';

  const filteredAndSortedCandidates = useMemo(() => {
    const search = searchTerm.toLowerCase();
    let filtered = candidates.filter((candidate) =>
      candidate.fullName.toLowerCase().includes(search) ||
      candidate.cpf.includes(search.replace(/\D/g, '')) ||
      candidate.desiredPosition1.toLowerCase().includes(search)
    );

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let valA: string | boolean | number = '';
        let valB: string | boolean | number = '';

        switch (sortField) {
          case 'fullName': valA = a.fullName; valB = b.fullName; break;
          case 'cpf': valA = a.cpf; valB = b.cpf; break;
          case 'interviewStatus': valA = getInterviewStatus(a.id); valB = getInterviewStatus(b.id); break;
          case 'desiredPosition1': valA = a.desiredPosition1; valB = b.desiredPosition1; break;
          case 'registrationDate': valA = a.registrationDate; valB = b.registrationDate; break;
          case 'hired': valA = isHired(a.id) ? 1 : 0; valB = isHired(b.id) ? 1 : 0; break;
          case 'pcd': valA = isPCD(a.id) ? 1 : 0; valB = isPCD(b.id) ? 1 : 0; break;
          case 'ns': valA = isNS(a.id) ? 1 : 0; valB = isNS(b.id) ? 1 : 0; break;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          const cmp = valA.localeCompare(valB, 'pt-BR');
          return sortDirection === 'asc' ? cmp : -cmp;
        }
        const cmp = (valA as number) - (valB as number);
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    return filtered;
  }, [candidates, searchTerm, sortField, sortDirection, hrDataMap]);

  const BoolBadge = ({ value, yesLabel = "Sim", noLabel = "Não" }: { value: boolean; yesLabel?: string; noLabel?: string }) => (
    <Badge variant={value ? "default" : "outline"} className={value ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
      {value ? yesLabel : noLabel}
    </Badge>
  );

  const InterviewBadge = ({ status }: { status: string }) => {
    const config: Record<string, { className: string }> = {
      'Não': { className: '' },
      'Sim': { className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      'Compareceu': { className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      'Não Compareceu': { className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };
    const c = config[status] || config['Não'];
    return (
      <Badge variant={status === 'Não' ? 'outline' : 'default'} className={c.className}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Lista de Candidatos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF ou vaga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredAndSortedCandidates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {candidates.length === 0
              ? "Nenhum candidato cadastrado ainda."
              : "Nenhum candidato encontrado com os termos de busca."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('fullName')}>
                    <span className="flex items-center">Nome <SortIcon field="fullName" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('cpf')}>
                    <span className="flex items-center">CPF <SortIcon field="cpf" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('interviewStatus')}>
                    <span className="flex items-center">Entrevista <SortIcon field="interviewStatus" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('desiredPosition1')}>
                    <span className="flex items-center">Vaga Desejada <SortIcon field="desiredPosition1" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('hired')}>
                    <span className="flex items-center">Contratado <SortIcon field="hired" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('pcd')}>
                    <span className="flex items-center">PCD <SortIcon field="pcd" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('ns')}>
                    <span className="flex items-center">N/S <SortIcon field="ns" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('registrationDate')}>
                    <span className="flex items-center">Data Cadastro <SortIcon field="registrationDate" /></span>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">
                      {candidate.fullName}
                    </TableCell>
                    <TableCell>{formatCpf(candidate.cpf)}</TableCell>
                    <TableCell><InterviewBadge status={getInterviewStatus(candidate.id)} /></TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {candidate.desiredPosition1}
                      </Badge>
                    </TableCell>
                    <TableCell><BoolBadge value={isHired(candidate.id)} /></TableCell>
                    <TableCell><BoolBadge value={isPCD(candidate.id)} /></TableCell>
                    <TableCell><BoolBadge value={isNS(candidate.id)} /></TableCell>
                    <TableCell>{formatDate(candidate.registrationDate)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectCandidate(candidate)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Ficha
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};