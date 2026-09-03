export interface HRAnnotation {
  id: string;
  text: string;
  createdAt: string;
}

export type ValidationStatus =
  | 'Não Iniciada'
  | 'Iniciada'
  | 'Aprovada'
  | 'Aprovada com Restrição'
  | 'Reprovada'
  | 'Em Análise'
  | 'Sim'
  | 'Não';

export type ProposalStatus = '-' | 'Sim' | 'Não' | 'Em Análise';

export type CurrentStage =
  | 'validation_form'
  | 'validation_manager'
  | 'validation_director'
  | 'proposal_presented'
  | 'proposal_accepted'
  | 'documentation'
  | 'hired';

/**
 * Estágios do Pipeline Contratado (Etapa 4.1).
 * Tipo separado de CurrentStage para não quebrar o Kanban atual.
 * Será utilizado pelo Pipeline Contratado em etapas futuras.
 */
export type HiredPipelineStage =
  | 'hired'
  | 'onboarding'
  | 'integrated'
  | 'active';

export const HIRED_PIPELINE_STAGE_OPTIONS: HiredPipelineStage[] = [
  'hired',
  'onboarding',
  'integrated',
  'active',
];

export const HIRED_PIPELINE_STAGE_LABELS: Record<HiredPipelineStage, string> = {
  hired: 'Contratado',
  onboarding: 'Onboarding',
  integrated: 'Integrado',
  active: 'Ativo',
};

export const CURRENT_STAGE_OPTIONS: CurrentStage[] = [
  'validation_form',
  'validation_manager',
  'validation_director',
  'proposal_presented',
  'proposal_accepted',
  'documentation',
  'hired',
];

export const CURRENT_STAGE_LABELS: Record<CurrentStage, string> = {
  validation_form: 'Validação da Ficha',
  validation_manager: 'Validação Gestores',
  validation_director: 'Validação da Entrevista',
  proposal_presented: 'Proposta Apresentada',
  proposal_accepted: 'Proposta Aceita',
  documentation: 'Documentação Entregue',
  hired: 'Contratado',
};

export const VALIDATION_STATUS_OPTIONS: ValidationStatus[] = [
  'Não Iniciada',
  'Iniciada',
  'Aprovada',
  'Aprovada com Restrição',
  'Reprovada',
];

export const PROPOSAL_STATUS_OPTIONS: ProposalStatus[] = ['-', 'Não', 'Sim'];

export interface ProcessEvaluation {
  currentStage: CurrentStage;
  fichaValidation: ValidationStatus;
  managementValidation: ValidationStatus;
  directorValidation: ValidationStatus;
  proposalPresented: ProposalStatus;
  proposalAccepted: ProposalStatus;
  documentationDelivered: ProposalStatus;
  candidateHired: ProposalStatus;
  talentBank: boolean;
  pcd: boolean;
  ns: boolean;
  interviewStatus: string;
  interviewDate?: string;
  interviewAttended?: 'Sim' | 'Não';
  interviewTime?: string;
  interviewObservation?: string;
}

export interface Admission {
  vacancyId?: string;
  vacancyDisplay?: string;
  admissionStatus?: string;
  definedSalary?: string;
  storeUnit?: string;
  workHours?: string;
  expectedStartDate?: string;
  observations?: string;
  /** Data em que o candidato foi contratado (preenchida por transitionToHired). */
  hiredAt?: string;
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

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

/**
 * Evento de auditoria do pipeline de contratação.
 * Persistido em hr_pipeline_events.
 */
export interface PipelineEvent {
  id: string;
  candidateId: string;
  fromStage?: string | null;
  toStage: string;
  eventType: string;
  createdBy?: string | null;
  createdAt: string;
}

export type PipelineEventType =
  | 'stage_changed'
  | 'hired'
  | 'onboarding_started'
  | 'integrated'
  | 'active';

export interface CandidateHRData {
  candidateId: string;
  photoUrl?: string;
  annotations: HRAnnotation[];
  evaluation: ProcessEvaluation;
  admission: Admission;
  termination: Termination;
  documentation: CandidateDocumentation;
  emergencyContacts: EmergencyContact[];
}

export const EVALUATION_STATUS_OPTIONS = ['Em Análise', 'Sim', 'Não'] as const;

export const INTERVIEW_STATUS_OPTIONS = [
  'Não Agendada',
  'Agendada',
  'Compareceu',
  'Não Compareceu',
  'Reagendada',
  'Cancelada'
] as const;

export type InterviewStatus = typeof INTERVIEW_STATUS_OPTIONS[number];

export const ADMISSION_STATUS_OPTIONS = [
  'Aguardando',
  'Em Processo',
  'Aprovado',
  'Contratado',
  'Cancelado'
];

export const RELATIONSHIP_OPTIONS = [
  'Avô/Avó',
  'Cônjuge',
  'Filho(a)',
  'Irmão(ã)',
  'Mãe',
  'Outro',
  'Pai',
];

export const createDefaultDocumentation = (): CandidateDocumentation => ({
  basicDocumentation: { checked: false },
  experienceContract: { checked: false },
  experienceExtension: { checked: false },
  priorNotice: { checked: false },
  terminationContract: { checked: false },
});

// Vacancies are now managed via VacancyContext