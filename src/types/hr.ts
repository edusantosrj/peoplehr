export interface HRAnnotation {
  id: string;
  text: string;
  createdAt: string;
}

export interface ProcessEvaluation {
  fichaValidation: 'Em Análise' | 'Sim' | 'Não';
  managementValidation: 'Em Análise' | 'Sim' | 'Não';
  directorValidation: 'Em Análise' | 'Sim' | 'Não';
  proposalPresented: 'Em Análise' | 'Sim' | 'Não';
  proposalAccepted: 'Em Análise' | 'Sim' | 'Não';
  documentationDelivered: 'Em Análise' | 'Sim' | 'Não';
  candidateHired: 'Em Análise' | 'Sim' | 'Não';
}

export interface Admission {
  vacancyId?: string;
  vacancyDisplay?: string;
  admissionStatus?: string;
  definedSalary?: string;
  storeUnit?: string;
  expectedStartDate?: string;
  observations?: string;
}

export interface Termination {
  requestDate?: string;
  voluntaryTermination?: boolean;
  terminationReason?: string;
  willServeNotice?: boolean;
  noticeDays?: number;
  lastWorkDay?: string;
  canBeRehired?: boolean;
  confirmed?: boolean;
}

export interface DocumentItem {
  checked: boolean;
  expirationDate?: string;
  completed?: boolean;
}

export interface CandidateDocumentation {
  basicDocumentation: DocumentItem;
  experienceContract: DocumentItem;
  experienceExtension: DocumentItem;
  priorNotice: DocumentItem;
  terminationContract: DocumentItem;
}

export type DocumentStatus = 'valid' | 'expiring' | 'expired';

export const DOCUMENT_LABELS: Record<keyof CandidateDocumentation, string> = {
  basicDocumentation: 'Documentação básica para contratação',
  experienceContract: 'Contrato de experiência',
  experienceExtension: 'Contrato de prorrogação do período de experiência',
  priorNotice: 'Aviso prévio',
  terminationContract: 'Contrato de rescisão de trabalho',
};

export interface CandidateHRData {
  candidateId: string;
  photoUrl?: string;
  annotations: HRAnnotation[];
  evaluation: ProcessEvaluation;
  admission: Admission;
  termination: Termination;
  documentation: CandidateDocumentation;
}

export const EVALUATION_STATUS_OPTIONS = ['Em Análise', 'Sim', 'Não'] as const;

export const ADMISSION_STATUS_OPTIONS = [
  'Aguardando',
  'Em Processo',
  'Aprovado',
  'Contratado',
  'Cancelado'
];

export const createDefaultDocumentation = (): CandidateDocumentation => ({
  basicDocumentation: { checked: false },
  experienceContract: { checked: false },
  experienceExtension: { checked: false },
  priorNotice: { checked: false },
  terminationContract: { checked: false },
});

// Vacancies are now managed via VacancyContext
