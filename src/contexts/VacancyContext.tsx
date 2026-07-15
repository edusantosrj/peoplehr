import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Vacancy } from '@/types/vacancy';
import { INITIAL_SECTORS, UNITS, SHIFTS } from '@/types/vacancy';
import { supabase } from '@/integrations/supabase/client';

type RemoveResult = { ok: boolean; reason?: string };

interface VacancyContextType {
  vacancies: Vacancy[];
  sectors: string[];
  units: string[];
  shifts: string[];
  loading: boolean;
  addVacancy: (vacancy: Vacancy) => Promise<void>;
  updateVacancy: (id: string, vacancy: Partial<Vacancy>) => Promise<void>;
  deleteVacancy: (id: string) => Promise<RemoveResult>;
  checkVacancyDependencies: (id: string) => Promise<{ hasDependencies: boolean; reason?: string }>;
  debitVacancy: (id: string) => Promise<boolean>;
  creditVacancy: (id: string) => Promise<boolean>;
  addSector: (sector: string) => void;
  removeSector: (sector: string) => RemoveResult;
  addUnit: (unit: string) => void;
  removeUnit: (unit: string) => RemoveResult;
  addShift: (shift: string) => void;
  removeShift: (shift: string) => RemoveResult;
  refreshVacancies: () => Promise<void>;
}

const HIDDEN_KEYS = {
  units: 'vacancy_hidden_units',
  shifts: 'vacancy_hidden_shifts',
  sectors: 'vacancy_hidden_sectors',
} as const;

const readHidden = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

const writeHidden = (key: string, values: string[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(new Set(values))));
  } catch {
    /* ignore */
  }
};

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
  observation: row.observation ?? '',
  mission: row.mission ?? '',
  responsibilities: row.responsibilities ?? '',
  expectations: row.expectations ?? '',
  offerings: row.offerings ?? '',
});


export const VacancyProvider = ({ children }: { children: ReactNode }) => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [sectors, setSectors] = useState<string[]>(() =>
    INITIAL_SECTORS.filter((s) => !readHidden(HIDDEN_KEYS.sectors).includes(s))
  );
  const [units, setUnits] = useState<string[]>(() =>
    [...UNITS].filter((u) => !readHidden(HIDDEN_KEYS.units).includes(u))
  );
  const [shifts, setShifts] = useState<string[]>(() =>
    [...SHIFTS].filter((s) => !readHidden(HIDDEN_KEYS.shifts).includes(s))
  );
  const [loading, setLoading] = useState(true);

  const fetchVacancies = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    // Anonymous users (public candidate form) cannot read the 'observation'
    // column which contains internal HR PII. Authenticated HR users get all columns.
    const publicColumns =
      'id,name,unit,shift,sector,type,quantity,work_hours_start,work_hours_end,gross_salary,status,created_at,updated_at,mission,responsibilities,expectations,offerings';
    const { data, error } = await supabase
      .from('vacancies')
      .select(session ? '*' : publicColumns)
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

    const hiddenSectors = readHidden(HIDDEN_KEYS.sectors);
    const hiddenUnits = readHidden(HIDDEN_KEYS.units);
    const hiddenShifts = readHidden(HIDDEN_KEYS.shifts);

    setSectors((prev) => {
      const merged = new Set([...INITIAL_SECTORS, ...prev, ...dbSectors]);
      // Never hide a value that is still in use by an existing vacancy.
      return Array.from(merged)
        .filter((s) => dbSectors.has(s) || !hiddenSectors.includes(s))
        .sort();
    });
    setUnits((prev) => {
      const merged = new Set([...UNITS, ...prev, ...dbUnits]);
      return Array.from(merged)
        .filter((u) => dbUnits.has(u) || !hiddenUnits.includes(u))
        .sort();
    });
    setShifts((prev) => {
      const merged = new Set([...SHIFTS, ...prev, ...dbShifts]);
      return Array.from(merged)
        .filter((s) => dbShifts.has(s) || !hiddenShifts.includes(s))
        .sort();
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
        observation: vacancy.observation ?? null,
        mission: vacancy.mission ?? null,
        responsibilities: vacancy.responsibilities ?? null,
        expectations: vacancy.expectations ?? null,
        offerings: vacancy.offerings ?? null,
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
    if (updates.observation !== undefined) dbUpdates.observation = updates.observation;
    if (updates.mission !== undefined) dbUpdates.mission = updates.mission;
    if (updates.responsibilities !== undefined) dbUpdates.responsibilities = updates.responsibilities;
    if (updates.expectations !== undefined) dbUpdates.expectations = updates.expectations;
    if (updates.offerings !== undefined) dbUpdates.offerings = updates.offerings;

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

  const creditVacancy = async (id: string): Promise<boolean> => {
    const vacancy = vacancies.find((v) => v.id === id);
    if (!vacancy) return false;

    const newQuantity = vacancy.quantity + 1;
    const { error } = await supabase
      .from('vacancies')
      .update({ quantity: newQuantity, status: 'Ativa', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao creditar vaga:', error);
      return false;
    }

    setVacancies((prev) =>
      prev.map((v) => (v.id === id ? { ...v, quantity: newQuantity, status: 'Ativa' } : v))
    );
    return true;
  };

  const addSector = (sector: string) => {
    const hidden = readHidden(HIDDEN_KEYS.sectors).filter((s) => s !== sector);
    writeHidden(HIDDEN_KEYS.sectors, hidden);
    if (!sectors.includes(sector)) {
      setSectors((prev) => [...prev, sector].sort());
    }
  };

  const removeSector = (sector: string): RemoveResult => {
    const inUse = vacancies.some((v) => v.sector === sector);
    if (inUse) {
      return { ok: false, reason: 'Existem vagas cadastradas utilizando este Setor. Remova ou altere essas vagas antes de excluir.' };
    }
    writeHidden(HIDDEN_KEYS.sectors, [...readHidden(HIDDEN_KEYS.sectors), sector]);
    setSectors((prev) => prev.filter((s) => s !== sector));
    return { ok: true };
  };

  const addUnit = (unit: string) => {
    const hidden = readHidden(HIDDEN_KEYS.units).filter((u) => u !== unit);
    writeHidden(HIDDEN_KEYS.units, hidden);
    if (!units.includes(unit)) {
      setUnits((prev) => [...prev, unit].sort());
    }
  };

  const removeUnit = (unit: string): RemoveResult => {
    const inUse = vacancies.some((v) => v.unit === unit);
    if (inUse) {
      return { ok: false, reason: 'Existem vagas cadastradas utilizando esta Unidade / Loja. Remova ou altere essas vagas antes de excluir.' };
    }
    writeHidden(HIDDEN_KEYS.units, [...readHidden(HIDDEN_KEYS.units), unit]);
    setUnits((prev) => prev.filter((u) => u !== unit));
    return { ok: true };
  };

  const addShift = (shift: string) => {
    const hidden = readHidden(HIDDEN_KEYS.shifts).filter((s) => s !== shift);
    writeHidden(HIDDEN_KEYS.shifts, hidden);
    if (!shifts.includes(shift)) {
      setShifts((prev) => [...prev, shift].sort());
    }
  };

  const removeShift = (shift: string): RemoveResult => {
    const inUse = vacancies.some((v) => v.shift === shift);
    if (inUse) {
      return { ok: false, reason: 'Existem vagas cadastradas utilizando este Turno. Remova ou altere essas vagas antes de excluir.' };
    }
    writeHidden(HIDDEN_KEYS.shifts, [...readHidden(HIDDEN_KEYS.shifts), shift]);
    setShifts((prev) => prev.filter((s) => s !== shift));
    return { ok: true };
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
        creditVacancy,
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
