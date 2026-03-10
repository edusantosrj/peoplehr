import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Vacancy } from '@/types/vacancy';
import { INITIAL_SECTORS, UNITS, SHIFTS } from '@/types/vacancy';

interface VacancyContextType {
  vacancies: Vacancy[];
  sectors: string[];
  units: string[];
  shifts: string[];
  addVacancy: (vacancy: Vacancy) => void;
  updateVacancy: (id: string, vacancy: Partial<Vacancy>) => void;
  deleteVacancy: (id: string) => void;
  addSector: (sector: string) => void;
  removeSector: (sector: string) => void;
  addUnit: (unit: string) => void;
  removeUnit: (unit: string) => void;
  addShift: (shift: string) => void;
  removeShift: (shift: string) => void;
}

const VacancyContext = createContext<VacancyContextType | undefined>(undefined);

// Mock initial vacancies
const INITIAL_VACANCIES: Vacancy[] = [
  {
    id: '1',
    name: 'Operador de Caixa',
    unit: 'Loja Centro',
    shift: 'Manhã',
    sector: 'Caixa',
    type: 'Nova Contratação',
    quantity: 3,
    workHoursStart: '06:00',
    workHoursEnd: '14:00',
    grossSalary: 1800,
    status: 'Ativa',
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    name: 'Repositor',
    unit: 'Loja Centro',
    shift: 'Tarde',
    sector: 'Estoque',
    type: 'Substituição',
    quantity: 2,
    workHoursStart: '14:00',
    workHoursEnd: '22:00',
    grossSalary: 1650,
    status: 'Ativa',
    createdAt: '2024-01-12T09:00:00Z',
  },
  {
    id: '3',
    name: 'Açougueiro',
    unit: 'Loja Norte',
    shift: 'Manhã',
    sector: 'Açougue',
    type: 'Nova Contratação',
    quantity: 1,
    workHoursStart: '06:00',
    workHoursEnd: '14:00',
    grossSalary: 2500,
    status: 'Ativa',
    createdAt: '2024-01-15T11:00:00Z',
  },
  {
    id: '4',
    name: 'Padeiro',
    unit: 'Loja Sul',
    shift: 'Noite',
    sector: 'Padaria',
    type: 'Substituição',
    quantity: 1,
    workHoursStart: '22:00',
    workHoursEnd: '06:00',
    grossSalary: 2200,
    status: 'Inativa',
    createdAt: '2024-01-08T08:00:00Z',
  },
  {
    id: '5',
    name: 'Auxiliar de Limpeza',
    unit: 'Loja Centro',
    shift: 'Integral',
    sector: 'Limpeza',
    type: 'Nova Contratação',
    quantity: 2,
    workHoursStart: '08:00',
    workHoursEnd: '17:00',
    grossSalary: 1500,
    status: 'Ativa',
    createdAt: '2024-01-20T14:00:00Z',
  },
  {
    id: '6',
    name: 'Atendente de Frios',
    unit: 'Loja Norte',
    shift: 'Tarde',
    sector: 'Frios',
    type: 'Nova Contratação',
    quantity: 1,
    workHoursStart: '14:00',
    workHoursEnd: '22:00',
    grossSalary: 1700,
    status: 'Inativa',
    createdAt: '2024-01-05T10:00:00Z',
  },
];

export const VacancyProvider = ({ children }: { children: ReactNode }) => {
  const [vacancies, setVacancies] = useState<Vacancy[]>(INITIAL_VACANCIES);
  const [sectors, setSectors] = useState<string[]>(INITIAL_SECTORS);

  const addVacancy = (vacancy: Vacancy) => {
    setVacancies((prev) => [...prev, vacancy]);
    // Add sector if it's new
    if (vacancy.sector && !sectors.includes(vacancy.sector)) {
      setSectors((prev) => [...prev, vacancy.sector].sort());
    }
  };

  const updateVacancy = (id: string, updates: Partial<Vacancy>) => {
    setVacancies((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
    // Add sector if it's new
    if (updates.sector && !sectors.includes(updates.sector)) {
      setSectors((prev) => [...prev, updates.sector!].sort());
    }
  };

  const deleteVacancy = (id: string) => {
    setVacancies((prev) => prev.filter((v) => v.id !== id));
  };

  const addSector = (sector: string) => {
    if (!sectors.includes(sector)) {
      setSectors((prev) => [...prev, sector].sort());
    }
  };

  return (
    <VacancyContext.Provider
      value={{
        vacancies,
        sectors,
        addVacancy,
        updateVacancy,
        deleteVacancy,
        addSector,
      }}
    >
      {children}
    </VacancyContext.Provider>
  );
};

export const useVacancies = () => {
  const context = useContext(VacancyContext);
  if (!context) {
    throw new Error('useVacancies must be used within a VacancyProvider');
  }
  return context;
};
