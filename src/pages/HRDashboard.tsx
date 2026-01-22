import { useState } from "react";
import { CandidateList } from "@/components/hr/CandidateList";
import { CandidateProfile } from "@/components/hr/CandidateProfile";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";

// Mock data for demonstration
const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "1",
    cpf: "12345678901",
    fullName: "João Silva Santos",
    registrationDate: "2024-01-15T10:30:00Z",
    birthDate: "1995-03-20",
    maritalStatus: "Solteiro(a)",
    motherName: "Maria Silva Santos",
    fatherName: "José Santos",
    whatsapp: "(11) 99999-9999",
    instagram: "@joaosilva",
    facebook: "joao.silva",
    address: "Rua das Flores",
    addressNumber: "123",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    education: "Ensino Médio Completo",
    hasTechnicalCourse: true,
    completedCourses: ["Informática Básica", "Atendimento ao Cliente"],
    otherCourses: "Curso de Inglês Básico",
    hasCriminalRecord: false,
    workExperiences: [
      {
        id: "exp1",
        company: "Supermercado ABC",
        position: "Operador de Caixa",
        startDate: "2022-01-10",
        endDate: "2023-12-15",
        currentlyWorking: false,
        reasonForLeaving: "Busca de novas oportunidades",
        referenceName: "Carlos Supervisor",
        referencePhone: "(11) 98888-8888",
      },
      {
        id: "exp2",
        company: "Loja XYZ",
        position: "Repositor",
        startDate: "2024-01-20",
        currentlyWorking: true,
        referenceName: "Ana Gerente",
        referencePhone: "(11) 97777-7777",
      },
    ],
    salaryExpectation: "R$ 2.000,00",
    immediateStart: true,
    availableWeekends: true,
    availableHolidays: false,
    desiredPosition1: "Operador de Caixa",
    desiredPosition2: "Repositor",
    lgpdConsent: true,
    lgpdConsentDate: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    cpf: "98765432100",
    fullName: "Maria Oliveira Costa",
    registrationDate: "2024-01-18T14:00:00Z",
    birthDate: "1990-08-15",
    maritalStatus: "Casado(a)",
    motherName: "Ana Oliveira",
    whatsapp: "(11) 98765-4321",
    address: "Av. Brasil",
    addressNumber: "456",
    neighborhood: "Jardim América",
    city: "São Paulo",
    state: "SP",
    education: "Superior Completo",
    course: "Administração",
    hasTechnicalCourse: false,
    completedCourses: ["Excel Avançado", "Gestão de Estoque"],
    hasCriminalRecord: false,
    workExperiences: [
      {
        id: "exp3",
        company: "Empresa Comercial Ltda",
        position: "Auxiliar Administrativo",
        startDate: "2018-03-01",
        endDate: "2023-11-30",
        currentlyWorking: false,
        reasonForLeaving: "Encerramento da empresa",
        referenceName: "Pedro Diretor",
        referencePhone: "(11) 96666-6666",
      },
    ],
    salaryExpectation: "R$ 3.500,00",
    immediateStart: false,
    availableWeekends: false,
    availableHolidays: true,
    desiredPosition1: "Auxiliar Administrativo",
    desiredPosition2: "Gerente de Loja",
    desiredPosition3: "Supervisor de Seção",
    lgpdConsent: true,
    lgpdConsentDate: "2024-01-18T14:00:00Z",
  },
];

const createInitialHRData = (candidateId: string): CandidateHRData => ({
  candidateId,
  annotations: [],
  evaluation: {
    fichaValidation: "Em Análise",
    managementValidation: "Em Análise",
    directorValidation: "Em Análise",
    proposalPresented: "Em Análise",
    proposalAccepted: "Em Análise",
    documentationDelivered: "Em Análise",
    candidateHired: "Em Análise",
  },
  admission: {},
  termination: {},
});

const HRDashboard = () => {
  const [candidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [hrDataMap, setHRDataMap] = useState<Record<string, CandidateHRData>>(() => {
    const initial: Record<string, CandidateHRData> = {};
    MOCK_CANDIDATES.forEach((c) => {
      initial[c.id] = createInitialHRData(c.id);
    });
    return initial;
  });

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleBack = () => {
    setSelectedCandidate(null);
  };

  const handleUpdateHRData = (data: CandidateHRData) => {
    setHRDataMap((prev) => ({
      ...prev,
      [data.candidateId]: data,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">
            Supermercados Marinho
          </h1>
          <p className="text-center text-primary-foreground/80 mt-1">
            Sistema de Recursos Humanos - Painel RH
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {selectedCandidate ? (
          <CandidateProfile
            candidate={selectedCandidate}
            hrData={hrDataMap[selectedCandidate.id]}
            onBack={handleBack}
            onUpdateHRData={handleUpdateHRData}
          />
        ) : (
          <CandidateList
            candidates={candidates}
            onSelectCandidate={handleSelectCandidate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Supermercados Marinho - Todos os direitos reservados</p>
          <p className="mt-1">Sistema de RH - Painel Administrativo</p>
        </div>
      </footer>
    </div>
  );
};

export default HRDashboard;
