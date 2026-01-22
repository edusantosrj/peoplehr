import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Briefcase } from 'lucide-react';
import type { Vacancy } from '@/types/vacancy';
import { formatWorkHours } from '@/types/vacancy';
import { useVacancies } from '@/contexts/VacancyContext';

interface VacancyCardProps {
  vacancy: Vacancy;
}

const VacancyCard = ({ vacancy }: VacancyCardProps) => (
  <div className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-semibold text-foreground">{vacancy.name}</h4>
      <Badge variant="outline" className="text-xs">
        {vacancy.quantity} vaga{vacancy.quantity !== 1 ? 's' : ''}
      </Badge>
    </div>
    <div className="space-y-1.5 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Briefcase className="h-3.5 w-3.5" />
        <span>{vacancy.sector}</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-3.5 w-3.5" />
        <span>{vacancy.shift}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5" />
        <span>{formatWorkHours(vacancy.workHoursStart, vacancy.workHoursEnd)}</span>
      </div>
    </div>
  </div>
);

interface TypeSectionProps {
  type: 'Substituição' | 'Nova Contratação';
  vacancies: Vacancy[];
}

const TypeSection = ({ type, vacancies }: TypeSectionProps) => {
  const total = vacancies.reduce((sum, v) => sum + v.quantity, 0);

  if (vacancies.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant={type === 'Nova Contratação' ? 'default' : 'secondary'}>
          {type}
        </Badge>
        <span className="text-sm text-muted-foreground">
          ({total} vaga{total !== 1 ? 's' : ''})
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {vacancies.map((vacancy) => (
          <VacancyCard key={vacancy.id} vacancy={vacancy} />
        ))}
      </div>
    </div>
  );
};

interface StatusSectionProps {
  status: 'Ativa' | 'Inativa';
  vacancies: Vacancy[];
}

const StatusSection = ({ status, vacancies }: StatusSectionProps) => {
  const substituicao = vacancies.filter((v) => v.type === 'Substituição');
  const novaContratacao = vacancies.filter((v) => v.type === 'Nova Contratação');

  const totalQuantity = vacancies.reduce((sum, v) => sum + v.quantity, 0);

  if (vacancies.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4
          className={`font-semibold ${
            status === 'Ativa' ? 'text-green-700' : 'text-muted-foreground'
          }`}
        >
          Vagas {status}s
        </h4>
        <Badge variant="outline">{totalQuantity} total</Badge>
      </div>
      <div className="space-y-6 pl-4 border-l-2 border-muted">
        <TypeSection type="Nova Contratação" vacancies={novaContratacao} />
        <TypeSection type="Substituição" vacancies={substituicao} />
      </div>
    </div>
  );
};

interface UnitSectionProps {
  unit: string;
  vacancies: Vacancy[];
}

const UnitSection = ({ unit, vacancies }: UnitSectionProps) => {
  const ativas = vacancies.filter((v) => v.status === 'Ativa');
  const inativas = vacancies.filter((v) => v.status === 'Inativa');

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          {unit}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatusSection status="Ativa" vacancies={ativas} />
        <StatusSection status="Inativa" vacancies={inativas} />
        {vacancies.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhuma vaga cadastrada para esta unidade.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export const VacancyMap = () => {
  const { vacancies } = useVacancies();

  const groupedByUnit = useMemo(() => {
    const grouped: Record<string, Vacancy[]> = {};

    vacancies.forEach((vacancy) => {
      if (!grouped[vacancy.unit]) {
        grouped[vacancy.unit] = [];
      }
      grouped[vacancy.unit].push(vacancy);
    });

    // Sort units alphabetically
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [vacancies]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-foreground">Mapa Estratégico de Vagas</h2>
      </div>

      {groupedByUnit.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma vaga cadastrada no sistema.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedByUnit.map(([unit, unitVacancies]) => (
            <UnitSection key={unit} unit={unit} vacancies={unitVacancies} />
          ))}
        </div>
      )}
    </div>
  );
};
