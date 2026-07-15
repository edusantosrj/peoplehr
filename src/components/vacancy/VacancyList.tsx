import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowUpDown, Edit, List, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Vacancy } from '@/types/vacancy';
import { formatSalary, VACANCY_TYPES } from '@/types/vacancy';
import { useVacancies } from '@/contexts/VacancyContext';

type SortField = keyof Vacancy;
type SortDirection = 'asc' | 'desc';

interface VacancyListProps {
  onEdit: (vacancy: Vacancy) => void;
  onNew: () => void;
}

const ALL = '__all__';

export const VacancyList = ({ onEdit, onNew }: VacancyListProps) => {
  const { vacancies, units, sectors, shifts, deleteVacancy } = useVacancies();
  const [pendingDelete, setPendingDelete] = useState<Vacancy | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const result = await deleteVacancy(pendingDelete.id);
    setDeleting(false);
    if (result.ok) {
      toast.success('Vaga excluída com sucesso.');
      setPendingDelete(null);
    } else {
      toast.error(result.reason ?? 'Não foi possível excluir a vaga.');
      setPendingDelete(null);
    }
  };
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [filterName, setFilterName] = useState('');
  const [filterUnit, setFilterUnit] = useState<string>(ALL);
  const [filterSector, setFilterSector] = useState<string>(ALL);
  const [filterShift, setFilterShift] = useState<string>(ALL);
  const [filterType, setFilterType] = useState<string>(ALL);

  const clearFilters = () => {
    setFilterName('');
    setFilterUnit(ALL);
    setFilterSector(ALL);
    setFilterShift(ALL);
    setFilterType(ALL);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredVacancies = useMemo(() => {
    const nameQuery = filterName.trim().toLowerCase();
    return vacancies.filter((v) => {
      if (nameQuery && !v.name.toLowerCase().includes(nameQuery)) return false;
      if (filterUnit !== ALL && v.unit !== filterUnit) return false;
      if (filterSector !== ALL && v.sector !== filterSector) return false;
      if (filterShift !== ALL && v.shift !== filterShift) return false;
      if (filterType !== ALL && v.type !== filterType) return false;
      return true;
    });
  }, [vacancies, filterName, filterUnit, filterSector, filterShift, filterType]);

  const sortedVacancies = useMemo(() => {
    return [...filteredVacancies].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredVacancies, sortField, sortDirection]);

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
      </div>
    </TableHead>
  );

  const hasActiveFilters =
    filterName !== '' ||
    filterUnit !== ALL ||
    filterSector !== ALL ||
    filterShift !== ALL ||
    filterType !== ALL;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <List className="h-5 w-5 text-primary" />
            Lista de Vagas
          </CardTitle>
          <Button onClick={onNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Vaga
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Nome da Vaga</Label>
              <Input
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Buscar..."
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unidade</Label>
              <Select value={filterUnit} onValueChange={setFilterUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Setor</Label>
              <Select value={filterSector} onValueChange={setFilterSector}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {sectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Turno</Label>
              <Select value={filterShift} onValueChange={setFilterShift}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {shifts.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo de Vaga</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {VACANCY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="name">Nome</SortableHeader>
                <SortableHeader field="unit">Unidade</SortableHeader>
                <SortableHeader field="sector">Setor</SortableHeader>
                <SortableHeader field="shift">Turno</SortableHeader>
                <SortableHeader field="type">Tipo</SortableHeader>
                <SortableHeader field="quantity">Qtd.</SortableHeader>
                <SortableHeader field="status">Status</SortableHeader>
                <SortableHeader field="grossSalary">Salário</SortableHeader>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVacancies.map((vacancy) => (
                <TableRow key={vacancy.id}>
                  <TableCell className="font-medium">{vacancy.name}</TableCell>
                  <TableCell>{vacancy.unit}</TableCell>
                  <TableCell>{vacancy.sector}</TableCell>
                  <TableCell>{vacancy.shift}</TableCell>
                  <TableCell>
                    <Badge variant={vacancy.type === 'Nova Contratação' ? 'default' : 'secondary'}>
                      {vacancy.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{vacancy.quantity}</TableCell>
                  <TableCell>
                    <Badge
                      variant={vacancy.status === 'Ativa' ? 'default' : 'outline'}
                      className={vacancy.status === 'Ativa' ? 'bg-green-600' : ''}
                    >
                      {vacancy.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatSalary(vacancy.grossSalary)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(vacancy)}
                        title="Editar vaga"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingDelete(vacancy)}
                        title="Excluir vaga"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sortedVacancies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {vacancies.length === 0
                      ? 'Nenhuma vaga cadastrada.'
                      : 'Nenhuma vaga encontrada com os filtros aplicados.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && !deleting && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir vaga?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a vaga{' '}
              <strong>{pendingDelete?.name}</strong> — {pendingDelete?.unit}?
              <br />
              Antes da exclusão, verificamos se existem funcionários contratados ou
              candidatos vinculados. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
