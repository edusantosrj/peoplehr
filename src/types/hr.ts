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

export interface CandidateHRData {
  candidateId: string;
  photoUrl?: string;
  annotations: HRAnnotation[];
  evaluation: ProcessEvaluation;
  admission: Admission;
  termination: Termination;
}

export const EVALUATION_STATUS_OPTIONS = ['Em Análise', 'Sim', 'Não'] as const;

export const ADMISSION_STATUS_OPTIONS = [
  'Aguardando',
  'Em Processo',
  'Aprovado',
  'Contratado',
  'Cancelado'
];

// Mock vacancies for display
export const MOCK_VACANCIES = [
  { id: '1', name: 'Operador de Caixa', shift: 'Manhã', unit: 'Loja Centro' },
  { id: '2', name: 'Repositor', shift: 'Tarde', unit: 'Loja Centro' },
  { id: '3', name: 'Açougueiro', shift: 'Manhã', unit: 'Loja Norte' },
  { id: '4', name: 'Padeiro', shift: 'Noite', unit: 'Loja Sul' },
  { id: '5', name: 'Auxiliar de Limpeza', shift: 'Integral', unit: 'Loja Centro' },
];
