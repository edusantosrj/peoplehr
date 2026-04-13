import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Vacancy } from '@/types/vacancy';
import { INITIAL_SECTORS, UNITS, SHIFTS } from '@/types/vacancy';
import { supabase } from '@/integrations/supabase/client';

interface VacancyContextType {
  vacancies: Vacancy[];
  sectors: string[];
  units: string[];
  shifts: string[];
  loading: boolean;
  addVacancy: (vacancy: Vacancy) => Promise<void>;
  updateVacancy: (id: string, vacancy: Partial<Vacancy>) => Promise<void>;
  deleteVacancy: (id: string) => void;
  debitVacancy: (id: string) => Promise<boolean>;
  addSector: (sector: string) => void;
  removeSector: (sector: string) => void;
  addUnit: (unit: string) => void;
  removeUnit: (unit: string) => void;
  addShift: (shift: string) => void;
  removeShift: (shift: string) => void;
  refreshVacancies: () => Promise<void>;
}

const VacancyContext = createContext<VacancyContextType | undefined>(undefined);

const mapRowToVacancy = (row: any): Vacancy => ({
  id: row.id,
  name: row.name,
  unit: row.unit,
  shift: row.shift,
  sector: row.sector,
  type: row.type,
  quantity: row.quantity,
  workHoursStart: row.work_hours_start,
  workHoursEnd: row.work_hours_end,
  grossSalary: Number(row.gross_salary),
  status: row.status,
  createdAt: row.created_at,
});

export const VacancyProvider = ({ children }: { children: ReactNode }) => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [sectors, setSectors] = useState<string[]>(INITIAL_SECTORS);
  const [units, setUnits] = useState<string[]>([...UNITS]);
  const [shifts, setShifts] = useState<string[]>([...SHIFTS]);
  const [loading, setLoading] = useState(true);

  const fetchVacancies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vacancies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar vagas:', error);
      setLoading(false);
      return;
    }

    const mapped = (data || []).map(mapRowToVacancy);
    setVacancies(mapped);

    // Derive dynamic sectors/units/shifts from existing vacancies
    const dbSectors = new Set(mapped.map((v) => v.sector).filter(Boolean));
    const dbUnits = new Set(mapped.map((v) => v.unit).filter(Boolean));
    const dbShifts = new Set(mapped.map((v) => v.shift).filter(Boolean));

    setSectors((prev) => {
      const merged = new Set([...INITIAL_SECTORS, ...prev, ...dbSectors]);
      return Array.from(merged).sort();
    });
    setUnits((prev) => {
      const merged = new Set([...UNITS, ...prev, ...dbUnits]);
      return Array.from(merged).sort();
    });
    setShifts((prev) => {
      const merged = new Set([...SHIFTS, ...prev, ...dbShifts]);
      return Array.from(merged).sort();
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  const addVacancy = async (vacancy: Vacancy) => {
    const { data, error } = await supabase
      .from('vacancies')
      .insert({
        name: vacancy.name,
        unit: vacancy.unit,
        shift: vacancy.shift,
        sector: vacancy.sector,
        type: vacancy.type,
        quantity: vacancy.quantity,
        work_hours_start: vacancy.workHoursStart,
        work_hours_end: vacancy.workHoursEnd,
        gross_salary: vacancy.grossSalary,
        status: vacancy.status,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar vaga:', error);
      return;
    }

    const newVacancy = mapRowToVacancy(data);
    setVacancies((prev) => [newVacancy, ...prev]);

    if (vacancy.sector && !sectors.includes(vacancy.sector)) {
      setSectors((prev) => [...prev, vacancy.sector].sort());
    }
  };

  const updateVacancy = async (id: string, updates: Partial<Vacancy>) => {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.shift !== undefined) dbUpdates.shift = updates.shift;
    if (updates.sector !== undefined) dbUpdates.sector = updates.sector;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.workHoursStart !== undefined) dbUpdates.work_hours_start = updates.workHoursStart;
    if (updates.workHoursEnd !== undefined) dbUpdates.work_hours_end = updates.workHoursEnd;
    if (updates.grossSalary !== undefined) dbUpdates.gross_salary = updates.grossSalary;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
      .from('vacancies')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar vaga:', error);
      return;
    }

    setVacancies((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );

    if (updates.sector && !sectors.includes(updates.sector)) {
      setSectors((prev) => [...prev, updates.sector!].sort());
    }
  };

  const deleteVacancy = (id: string) => {
    setVacancies((prev) => prev.filter((v) => v.id !== id));
  };

  const debitVacancy = async (id: string): Promise<boolean> => {
    const vacancy = vacancies.find((v) => v.id === id);
    if (!vacancy || vacancy.quantity <= 0) return false;

    const newQuantity = vacancy.quantity - 1;
    const { error } = await supabase
      .from('vacancies')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao debitar vaga:', error);
      return false;
    }

    setVacancies((prev) =>
      prev.map((v) => (v.id === id ? { ...v, quantity: newQuantity } : v))
    );
    return true;
  };

  const addSector = (sector: string) => {
    if (!sectors.includes(sector)) {
      setSectors((prev) => [...prev, sector].sort());
    }
  };

  const removeSector = (sector: string) => {
    setSectors((prev) => prev.filter((s) => s !== sector));
  };

  const addUnit = (unit: string) => {
    if (!units.includes(unit)) {
      setUnits((prev) => [...prev, unit].sort());
    }
  };

  const removeUnit = (unit: string) => {
    setUnits((prev) => prev.filter((u) => u !== unit));
  };

  const addShift = (shift: string) => {
    if (!shifts.includes(shift)) {
      setShifts((prev) => [...prev, shift].sort());
    }
  };

  const removeShift = (shift: string) => {
    setShifts((prev) => prev.filter((s) => s !== shift));
  };

  return (
    <VacancyContext.Provider
      value={{
        vacancies,
        sectors,
        units,
        shifts,
        loading,
        addVacancy,
        updateVacancy,
        deleteVacancy,
        debitVacancy,
        addSector,
        removeSector,
        addUnit,
        removeUnit,
        addShift,
        removeShift,
        refreshVacancies: fetchVacancies,
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
