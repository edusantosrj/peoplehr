export interface Vacancy {
  id: string;
  name: string;
  unit: string;
  shift: string;
  sector: string;
  type: 'Substituição' | 'Nova Contratação';
  quantity: number;
  workHoursStart: string;
  workHoursEnd: string;
  grossSalary: number;
  status: 'Ativa' | 'Inativa';
  createdAt: string;
}

export const UNITS = [
  'Loja Centro',
  'Loja Norte',
  'Loja Sul',
  'Loja Leste',
  'Loja Oeste',
];

export const SHIFTS = [
  'Manhã',
  'Tarde',
  'Noite',
  'Integral',
];

export const VACANCY_TYPES = ['Substituição', 'Nova Contratação'] as const;

export const VACANCY_STATUS = ['Ativa', 'Inativa'] as const;

// Initial sectors - will grow dynamically as users add new ones
export const INITIAL_SECTORS = [
  'Açougue',
  'Padaria',
  'Frios',
  'Hortifruti',
  'Mercearia',
  'Caixa',
  'Limpeza',
  'Estoque',
  'Administrativo',
];

export const formatVacancyDisplay = (vacancy: Vacancy): string => {
  return `${vacancy.name} - ${vacancy.shift} - ${vacancy.unit}`;
};

export const formatWorkHours = (start: string, end: string): string => {
  return `Das ${start} às ${end}`;
};

export const formatSalary = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};
