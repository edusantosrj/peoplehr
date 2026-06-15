import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Users, ArrowUpDown, ArrowUp, ArrowDown, X, Filter } from "lucide-react";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";
import { formatDateDisplay } from "@/utils/textFormatting";

interface CandidateListProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  hrDataMap?: Record<string, CandidateHRData>;
}

type SortField = 'fullName' | 'cpf' | 'interviewStatus' | 'desiredPosition1' | 'hired' | 'terminated' | 'hiredVacancy' | 'storeUnit' | 'pcd' | 'ns' | 'registrationDate';
type SortDirection = 'asc' | 'desc' | null;

type TriState = 'all' | 'yes' | 'no';
type DatePreset = 'custom' | 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth';

const ALL = '__all__';

const toDateInput = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parseRegDate = (s: string): Date | null => {
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return null;
};

export const CandidateList = ({
  candidates,
  onSelectCandidate,
  hrDataMap = {},
}: CandidateListProps) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Filters
  const [fName, setFName] = useState("");
  const [fCpf, setFCpf] = useState("");
  const [fWhats, setFWhats] = useState("");
  const [fInterview, setFInterview] = useState<string>(ALL);
  const [fDesired, setFDesired] = useState<string>(ALL);
  const [fHired, setFHired] = useState<TriState>('all');
  const [fTerminated, setFTerminated] = useState<TriState>('all');
  const [fHiredVacancy, setFHiredVacancy] = useState<string>(ALL);
  const [fStore, setFStore] = useState<string>(ALL);
  const [fPcd, setFPcd] = useState<TriState>('all');
  const [fNs, setFNs] = useState<TriState>('all');
  const [fPreset, setFPreset] = useState<DatePreset>('custom');
  const [fDateStart, setFDateStart] = useState<string>("");
  const [fDateEnd, setFDateEnd] = useState<string>("");

  const formatCpf = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = formatDateDisplay;

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

  const isHired = (id: string) => hrDataMap[id]?.admission?.admissionStatus === 'Contratado';
  const isTerminated = (id: string) => hrDataMap[id]?.termination?.confirmed === true;
  const getHiredVacancy = (id: string) => hrDataMap[id]?.admission?.vacancyDisplay || '';
  const getStoreUnit = (id: string) => hrDataMap[id]?.admission?.storeUnit || '';
  const isPCD = (id: string) => hrDataMap[id]?.evaluation?.pcd || false;
  const isNS = (id: string) => hrDataMap[id]?.evaluation?.ns || false;
  const getInterviewStatus = (id: string) => hrDataMap[id]?.evaluation?.interviewStatus || 'Não';

  // Build option lists from current data
  const desiredOptions = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => {
      [c.desiredPosition1, c.desiredPosition2, c.desiredPosition3].forEach((p) => {
        if (p && p.trim()) set.add(p.trim());
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [candidates]);

  const hiredVacancyOptions = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => {
      const v = getHiredVacancy(c.id);
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [candidates, hrDataMap]);

  const storeOptions = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => {
      const v = getStoreUnit(c.id);
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [candidates, hrDataMap]);

  const applyPreset = (preset: DatePreset) => {
    setFPreset(preset);
    if (preset === 'custom') return;
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;
    if (preset === 'today') { start = now; end = now; }
    else if (preset === 'yesterday') {
      const y = new Date(now); y.setDate(now.getDate() - 1);
      start = y; end = y;
    }
    else if (preset === 'last7') {
      const s = new Date(now); s.setDate(now.getDate() - 6);
      start = s; end = now;
    }
    else if (preset === 'last30') {
      const s = new Date(now); s.setDate(now.getDate() - 29);
      start = s; end = now;
    }
    else if (preset === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
    }
    else if (preset === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    }
    if (start && end) {
      setFDateStart(toDateInput(start));
      setFDateEnd(toDateInput(end));
    }
  };

  const clearFilters = () => {
    setFName(""); setFCpf(""); setFWhats("");
    setFInterview(ALL); setFDesired(ALL);
    setFHired('all'); setFTerminated('all');
    setFHiredVacancy(ALL); setFStore(ALL);
    setFPcd('all'); setFNs('all');
    setFPreset('custom'); setFDateStart(""); setFDateEnd("");
  };

  const filteredAndSortedCandidates = useMemo(() => {
    const triMatch = (state: TriState, v: boolean) => state === 'all' || (state === 'yes' ? v : !v);
    const nameQ = fName.trim().toLowerCase();
    const cpfQ = fCpf.replace(/\D/g, '');
    const whatsQ = fWhats.replace(/\D/g, '');
    const startD = fDateStart ? new Date(fDateStart + 'T00:00:00') : null;
    const endD = fDateEnd ? new Date(fDateEnd + 'T23:59:59') : null;

    let filtered = candidates.filter((c) => {
      if (nameQ && !c.fullName.toLowerCase().includes(nameQ)) return false;
      if (cpfQ && !c.cpf.replace(/\D/g, '').includes(cpfQ)) return false;
      if (whatsQ && !(c.whatsapp || '').replace(/\D/g, '').includes(whatsQ)) return false;
      if (fInterview !== ALL && getInterviewStatus(c.id) !== fInterview) return false;
      if (fDesired !== ALL) {
        const positions = [c.desiredPosition1, c.desiredPosition2, c.desiredPosition3].filter(Boolean);
        if (!positions.includes(fDesired)) return false;
      }
      if (!triMatch(fHired, isHired(c.id))) return false;
      if (!triMatch(fTerminated, isTerminated(c.id))) return false;
      if (fHiredVacancy !== ALL && getHiredVacancy(c.id) !== fHiredVacancy) return false;
      if (fStore !== ALL && getStoreUnit(c.id) !== fStore) return false;
      if (!triMatch(fPcd, isPCD(c.id))) return false;
      if (!triMatch(fNs, isNS(c.id))) return false;
      if (startD || endD) {
        const d = parseRegDate(c.registrationDate);
        if (!d) return false;
        if (startD && d < startD) return false;
        if (endD && d > endD) return false;
      }
      return true;
    });

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';
        switch (sortField) {
          case 'fullName': valA = a.fullName; valB = b.fullName; break;
          case 'cpf': valA = a.cpf; valB = b.cpf; break;
          case 'interviewStatus': valA = getInterviewStatus(a.id); valB = getInterviewStatus(b.id); break;
          case 'desiredPosition1': valA = a.desiredPosition1; valB = b.desiredPosition1; break;
          case 'registrationDate': valA = a.registrationDate; valB = b.registrationDate; break;
          case 'hired': valA = isHired(a.id) ? 1 : 0; valB = isHired(b.id) ? 1 : 0; break;
          case 'terminated': valA = isTerminated(a.id) ? 1 : 0; valB = isTerminated(b.id) ? 1 : 0; break;
          case 'hiredVacancy': valA = getHiredVacancy(a.id); valB = getHiredVacancy(b.id); break;
          case 'storeUnit': valA = getStoreUnit(a.id); valB = getStoreUnit(b.id); break;
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
  }, [candidates, hrDataMap, sortField, sortDirection,
    fName, fCpf, fWhats, fInterview, fDesired, fHired, fTerminated,
    fHiredVacancy, fStore, fPcd, fNs, fDateStart, fDateEnd]);

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

  const TriSelect = ({ value, onChange, label }: { value: TriState; onChange: (v: TriState) => void; label: string }) => (
    <Select value={value} onValueChange={(v) => onChange(v as TriState)}>
      <SelectTrigger className="h-9"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}: Todos</SelectItem>
        <SelectItem value="yes">Sim</SelectItem>
        <SelectItem value="no">Não</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Lista de Candidatos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-3 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" /> Filtros
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
              <X className="h-4 w-4 mr-1" /> Limpar Filtros
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <Input placeholder="Nome" value={fName} onChange={(e) => setFName(e.target.value)} className="h-9" />
            <Input placeholder="CPF" value={fCpf} onChange={(e) => setFCpf(e.target.value)} className="h-9" />
            <Input placeholder="WhatsApp" value={fWhats} onChange={(e) => setFWhats(e.target.value)} className="h-9" />

            <Select value={fInterview} onValueChange={setFInterview}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Entrevista" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Entrevista: Todas</SelectItem>
                <SelectItem value="Não">Não Agendada</SelectItem>
                <SelectItem value="Sim">Agendada</SelectItem>
                <SelectItem value="Compareceu">Compareceu</SelectItem>
                <SelectItem value="Não Compareceu">Não Compareceu</SelectItem>
              </SelectContent>
            </Select>

            <Select value={fDesired} onValueChange={setFDesired}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Vaga Desejada" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Vaga Desejada: Todas</SelectItem>
                {desiredOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>

            <TriSelect value={fHired} onChange={setFHired} label="Contratado" />
            <TriSelect value={fTerminated} onChange={setFTerminated} label="Demitido" />

            <Select value={fHiredVacancy} onValueChange={setFHiredVacancy}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Vaga Contratada" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Vaga Contratada: Todas</SelectItem>
                {hiredVacancyOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={fStore} onValueChange={setFStore}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Loja / Unidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Loja / Unidade: Todas</SelectItem>
                {storeOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>

            <TriSelect value={fPcd} onChange={setFPcd} label="PCD" />
            <TriSelect value={fNs} onChange={setFNs} label="N/S" />
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">Período rápido</label>
              <Select value={fPreset} onValueChange={(v) => applyPreset(v as DatePreset)}>
                <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Personalizado</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="yesterday">Ontem</SelectItem>
                  <SelectItem value="last7">Últimos 7 dias</SelectItem>
                  <SelectItem value="last30">Últimos 30 dias</SelectItem>
                  <SelectItem value="thisMonth">Este mês</SelectItem>
                  <SelectItem value="lastMonth">Mês anterior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">Data inicial</label>
              <Input type="date" value={fDateStart} onChange={(e) => { setFDateStart(e.target.value); setFPreset('custom'); }} className="h-9 w-[160px]" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">Data final</label>
              <Input type="date" value={fDateEnd} onChange={(e) => { setFDateEnd(e.target.value); setFPreset('custom'); }} className="h-9 w-[160px]" />
            </div>
            <div className="ml-auto text-xs text-muted-foreground self-center">
              {filteredAndSortedCandidates.length} de {candidates.length} candidato(s)
            </div>
          </div>
        </div>

        {filteredAndSortedCandidates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {candidates.length === 0
              ? "Nenhum candidato cadastrado ainda."
              : "Nenhum candidato encontrado com os filtros aplicados."}
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
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('terminated')}>
                    <span className="flex items-center">Demitido <SortIcon field="terminated" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('hiredVacancy')}>
                    <span className="flex items-center">Vaga Contratado <SortIcon field="hiredVacancy" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('storeUnit')}>
                    <span className="flex items-center">Loja/Unidade <SortIcon field="storeUnit" /></span>
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
                  <TableHead className="w-12 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={candidate.selfieUrl || undefined} alt={candidate.fullName} />
                          <AvatarFallback>{candidate.fullName.trim().charAt(0).toUpperCase() || '—'}</AvatarFallback>
                        </Avatar>
                        <span>{candidate.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCpf(candidate.cpf)}</TableCell>
                    <TableCell><InterviewBadge status={getInterviewStatus(candidate.id)} /></TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {candidate.desiredPosition1}
                      </Badge>
                    </TableCell>
                    <TableCell><BoolBadge value={isHired(candidate.id)} /></TableCell>
                    <TableCell><BoolBadge value={isTerminated(candidate.id)} /></TableCell>
                    <TableCell>{getHiredVacancy(candidate.id) || '—'}</TableCell>
                    <TableCell>{getStoreUnit(candidate.id) || '—'}</TableCell>
                    <TableCell><BoolBadge value={isPCD(candidate.id)} /></TableCell>
                    <TableCell><BoolBadge value={isNS(candidate.id)} /></TableCell>
                    <TableCell>{formatDate(candidate.registrationDate)}</TableCell>
                    <TableCell className="text-right w-12">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelectCandidate(candidate)}
                        title="Ver Ficha"
                        aria-label="Ver Ficha"
                      >
                        <Eye className="h-4 w-4" />
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
