import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, Edit, List, Plus } from 'lucide-react';
import type { Vacancy } from '@/types/vacancy';
import { formatSalary } from '@/types/vacancy';
import { useVacancies } from '@/contexts/VacancyContext';

type SortField = keyof Vacancy;
type SortDirection = 'asc' | 'desc';

interface VacancyListProps {
  onEdit: (vacancy: Vacancy) => void;
  onNew: () => void;
}

export const VacancyList = ({ onEdit, onNew }: VacancyListProps) => {
  const { vacancies } = useVacancies();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedVacancies = useMemo(() => {
    return [...vacancies].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [vacancies, sortField, sortDirection]);

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
      <CardContent>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(vacancy)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sortedVacancies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhuma vaga cadastrada.
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
