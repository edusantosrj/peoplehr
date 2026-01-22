import { useState, useMemo } from "react";
import { useVacancies } from "@/contexts/VacancyContext";
import { ReportFilters, type ReportFiltersState } from "./ReportFilters";
import { FunnelReport } from "./FunnelReport";
import { AdmissionsReport } from "./AdmissionsReport";
import { TerminationsReport } from "./TerminationsReport";
import { VacanciesReport } from "./VacanciesReport";
import { TalentBankReport } from "./TalentBankReport";
import { UNITS } from "@/types/vacancy";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";

interface ReportsModuleProps {
  candidates: Candidate[];
  hrDataMap: Record<string, CandidateHRData>;
}

export const ReportsModule = ({ candidates, hrDataMap }: ReportsModuleProps) => {
  const { vacancies, sectors } = useVacancies();
  
  const [filters, setFilters] = useState<ReportFiltersState>({
    startDate: undefined,
    endDate: undefined,
    unit: "",
    vacancy: "",
    sector: "",
  });

  // Get unique vacancy names for filter
  const vacancyOptions = useMemo(() => {
    return vacancies.map((v) => ({ id: v.id, name: v.name }));
  }, [vacancies]);

  // Apply filters to candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const hrData = hrDataMap[candidate.id];
      const regDate = new Date(candidate.registrationDate);

      // Date range filter
      if (filters.startDate && regDate < filters.startDate) {
        return false;
      }
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (regDate > endOfDay) {
          return false;
        }
      }

      // Unit filter
      if (filters.unit && hrData?.admission?.storeUnit !== filters.unit) {
        // Also check vacancy's unit
        const vacancyId = hrData?.admission?.vacancyId;
        const vacancy = vacancies.find((v) => v.id === vacancyId);
        if (vacancy?.unit !== filters.unit) {
          return false;
        }
      }

      // Vacancy filter
      if (filters.vacancy && hrData?.admission?.vacancyId !== filters.vacancy) {
        return false;
      }

      // Sector filter
      if (filters.sector) {
        const vacancyId = hrData?.admission?.vacancyId;
        const vacancy = vacancies.find((v) => v.id === vacancyId);
        if (vacancy?.sector !== filters.sector) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, hrDataMap, filters, vacancies]);

  // Apply filters to vacancies
  const filteredVacancies = useMemo(() => {
    return vacancies.filter((vacancy) => {
      // Date range filter
      const createdAt = new Date(vacancy.createdAt);
      if (filters.startDate && createdAt < filters.startDate) {
        return false;
      }
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (createdAt > endOfDay) {
          return false;
        }
      }

      // Unit filter
      if (filters.unit && vacancy.unit !== filters.unit) {
        return false;
      }

      // Vacancy filter (specific vacancy)
      if (filters.vacancy && vacancy.id !== filters.vacancy) {
        return false;
      }

      // Sector filter
      if (filters.sector && vacancy.sector !== filters.sector) {
        return false;
      }

      return true;
    });
  }, [vacancies, filters]);

  return (
    <div className="space-y-6">
      {/* Global Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        units={UNITS}
        vacancies={vacancyOptions}
        sectors={sectors}
      />

      {/* Reports */}
      <div className="space-y-6">
        {/* Report 1: Selection Funnel */}
        <FunnelReport
          candidates={filteredCandidates}
          hrDataMap={hrDataMap}
        />

        {/* Report 2: Admissions */}
        <AdmissionsReport
          candidates={filteredCandidates}
          hrDataMap={hrDataMap}
          vacancies={filteredVacancies}
        />

        {/* Report 3: Terminations */}
        <TerminationsReport
          candidates={filteredCandidates}
          hrDataMap={hrDataMap}
          vacancies={filteredVacancies}
        />

        {/* Report 4: Vacancies */}
        <VacanciesReport
          vacancies={filteredVacancies}
          candidates={filteredCandidates}
          hrDataMap={hrDataMap}
        />

        {/* Report 5: Talent Bank */}
        <TalentBankReport
          candidates={filteredCandidates}
          hrDataMap={hrDataMap}
        />
      </div>
    </div>
  );
};
