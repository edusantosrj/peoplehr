import { useState } from "react";
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
import { Search, Eye, Users } from "lucide-react";
import type { Candidate } from "@/types/candidate";

interface CandidateListProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
}

export const CandidateList = ({
  candidates,
  onSelectCandidate,
}: CandidateListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const formatCpf = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const search = searchTerm.toLowerCase();
    return (
      candidate.fullName.toLowerCase().includes(search) ||
      candidate.cpf.includes(search.replace(/\D/g, '')) ||
      candidate.desiredPosition1.toLowerCase().includes(search)
    );
  });

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

        {filteredCandidates.length === 0 ? (
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
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Vaga Desejada</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">
                      {candidate.fullName}
                    </TableCell>
                    <TableCell>{formatCpf(candidate.cpf)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {candidate.desiredPosition1}
                      </Badge>
                    </TableCell>
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
