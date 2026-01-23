import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileWarning, CheckCircle, AlertTriangle, XCircle, Filter } from "lucide-react";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData, CandidateDocumentation, DocumentStatus } from "@/types/hr";
import { DOCUMENT_LABELS } from "@/types/hr";
import { getDocumentStatus } from "../blocks/DocumentationBlock";
import { useVacancies } from "@/contexts/VacancyContext";

interface DocumentsControlPanelProps {
  candidates: Candidate[];
  hrDataMap: Record<string, CandidateHRData>;
}

interface DocumentAlert {
  candidateId: string;
  candidateName: string;
  cpf: string;
  unit: string;
  documentKey: keyof CandidateDocumentation;
  documentLabel: string;
  expirationDate: string;
  status: DocumentStatus;
}

const maskCPF = (cpf: string): string => {
  if (!cpf || cpf.length < 11) return cpf;
  return `${cpf.slice(0, 3)}.***.***-${cpf.slice(-2)}`;
};

const StatusIcon = ({ status }: { status: DocumentStatus }) => {
  switch (status) {
    case 'valid':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'expiring':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'expired':
      return <XCircle className="h-4 w-4 text-red-600" />;
  }
};

const StatusBadge = ({ status }: { status: DocumentStatus }) => {
  const config = {
    valid: { label: 'Válido', variant: 'default' as const, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    expiring: { label: 'Vence em breve', variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    expired: { label: 'Vencido', variant: 'destructive' as const, className: '' },
  };
  
  const { label, variant, className } = config[status];
  
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export const DocumentsControlPanel = ({ candidates, hrDataMap }: DocumentsControlPanelProps) => {
  const { vacancies } = useVacancies();
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Get hired candidates only
  const hiredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const hrData = hrDataMap[c.id];
      if (!hrData) return false;
      return hrData.admission?.admissionStatus === 'Contratado' && !hrData.termination?.confirmed;
    });
  }, [candidates, hrDataMap]);

  // Build document alerts list
  const documentAlerts = useMemo((): DocumentAlert[] => {
    const alerts: DocumentAlert[] = [];
    const documentKeys = Object.keys(DOCUMENT_LABELS) as (keyof CandidateDocumentation)[];

    hiredCandidates.forEach(candidate => {
      const hrData = hrDataMap[candidate.id];
      if (!hrData?.documentation) return;

      const unit = hrData.admission?.storeUnit || '—';

      documentKeys.forEach(key => {
        if (key === 'basicDocumentation') return; // No expiration date for basic docs
        
        const doc = hrData.documentation[key];
        if (!doc.expirationDate) return;
        
        const status = getDocumentStatus(doc.expirationDate);
        if (!status) return;

        alerts.push({
          candidateId: candidate.id,
          candidateName: candidate.fullName,
          cpf: candidate.cpf,
          unit,
          documentKey: key,
          documentLabel: DOCUMENT_LABELS[key],
          expirationDate: doc.expirationDate,
          status,
        });
      });
    });

    return alerts;
  }, [hiredCandidates, hrDataMap]);

  // Get unique units from hired candidates
  const availableUnits = useMemo(() => {
    const units = new Set<string>();
    hiredCandidates.forEach(c => {
      const unit = hrDataMap[c.id]?.admission?.storeUnit;
      if (unit) units.add(unit);
    });
    return Array.from(units).sort();
  }, [hiredCandidates, hrDataMap]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return documentAlerts.filter(alert => {
      if (selectedUnit !== 'all' && alert.unit !== selectedUnit) return false;
      if (selectedDocument !== 'all' && alert.documentKey !== selectedDocument) return false;
      if (selectedStatus !== 'all' && alert.status !== selectedStatus) return false;
      return true;
    });
  }, [documentAlerts, selectedUnit, selectedDocument, selectedStatus]);

  // Count alerts by status
  const alertCounts = useMemo(() => {
    return {
      total: documentAlerts.length,
      valid: documentAlerts.filter(a => a.status === 'valid').length,
      expiring: documentAlerts.filter(a => a.status === 'expiring').length,
      expired: documentAlerts.filter(a => a.status === 'expired').length,
    };
  }, [documentAlerts]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{alertCounts.total}</div>
            <p className="text-sm text-muted-foreground">Total de Documentos</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-6 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-700">{alertCounts.valid}</div>
              <p className="text-sm text-muted-foreground">Válidos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-700">{alertCounts.expiring}</div>
              <p className="text-sm text-muted-foreground">Vencendo em breve</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-6 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-700">{alertCounts.expired}</div>
              <p className="text-sm text-muted-foreground">Vencidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {availableUnits.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os documentos" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Todos os documentos</SelectItem>
                  {(Object.keys(DOCUMENT_LABELS) as (keyof CandidateDocumentation)[])
                    .filter(key => key !== 'basicDocumentation')
                    .map(key => (
                      <SelectItem key={key} value={key}>{DOCUMENT_LABELS[key]}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status do Prazo</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="valid">Válido</SelectItem>
                  <SelectItem value="expiring">Vence em breve</SelectItem>
                  <SelectItem value="expired">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5" />
            Controle de Documentos e Prazos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum documento encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert, index) => (
                    <TableRow key={`${alert.candidateId}-${alert.documentKey}-${index}`}>
                      <TableCell className="font-medium">{alert.candidateName}</TableCell>
                      <TableCell>{maskCPF(alert.cpf)}</TableCell>
                      <TableCell>{alert.unit}</TableCell>
                      <TableCell>{alert.documentLabel}</TableCell>
                      <TableCell>{formatDate(alert.expirationDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={alert.status} />
                          <StatusBadge status={alert.status} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
