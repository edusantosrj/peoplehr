export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  reasonForLeaving?: string;
  referenceName: string;
  referencePhone: string;
}

export interface Candidate {
  id: string;
  cpf: string;
  fullName: string;
  nickname?: string;
  gender?: string;
  registrationDate: string;
  
  // Personal Data
  birthDate: string;
  age?: number;
  maritalStatus: string;
  motherName: string;
  fatherName?: string;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  
  // Address
  address: string;
  addressNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  
  // Education
  education: string;
  course?: string;
  period?: string;
  hasTechnicalCourse: boolean;
  completedCourses: string[];
  otherCourses?: string;
  
  // Background
  hasCriminalRecord: boolean;
  
  // First Job
  firstJob: boolean;
  
  // Work Experience
  workExperiences: WorkExperience[];
  
  // Aspirations
  salaryExpectation: string;
  immediateStart: boolean;
  availableWeekends: boolean;
  availableHolidays: boolean;
  desiredPosition1: string;
  desiredPosition2?: string;
  desiredPosition3?: string;
  
  // Uploads
  resumeUrl?: string;
  otherFilesUrls?: string[];
  selfieUrl?: string;
  
  // LGPD
  lgpdConsent: boolean;
  lgpdConsentDate?: string;
}

export const MARITAL_STATUS_OPTIONS = [
  'Casado(a)',
  'Divorciado(a)',
  'Solteiro(a)',
  'União Estável',
  'Viúvo(a)',
];

export const GENDER_OPTIONS = [
  'Masculino',
  'Feminino',
  'Não Informar',
];

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const EDUCATION_LEVELS = [
  'Ensino Fundamental Incompleto',
  'Ensino Fundamental Completo',
  'Ensino Médio Incompleto',
  'Ensino Médio Completo',
  'Superior Incompleto',
  'Superior Completo',
  'Pós-Graduação Incompleta',
  'Pós-Graduação Completa'
];

export const AVAILABLE_COURSES = [
  'Atendimento ao Cliente',
  'Excel Avançado',
  'Gestão de Estoque',
  'Informática Básica',
  'Logística',
  'Manipulação de Alimentos',
  'Operador de Caixa',
  'Primeiros Socorros',
  'Segurança do Trabalho',
  'Técnicas de Vendas',
];

export const AVAILABLE_POSITIONS = [
  'Açougueiro',
  'Atendente de Frios',
  'Auxiliar Administrativo',
  'Auxiliar de Limpeza',
  'Confeiteiro',
  'Estoquista',
  'Fiscal de Loja',
  'Gerente de Loja',
  'Motorista',
  'Operador de Caixa',
  'Padeiro',
  'Repositor',
  'Supervisor de Seção',
];
