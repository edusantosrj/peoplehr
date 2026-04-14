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
  otherFilesUrl?: string;
  selfieUrl?: string;
  
  // LGPD
  lgpdConsent: boolean;
  lgpdConsentDate?: string;
}

export const MARITAL_STATUS_OPTIONS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União Estável'
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
  'Informática Básica',
  'Excel Avançado',
  'Atendimento ao Cliente',
  'Operador de Caixa',
  'Técnicas de Vendas',
  'Gestão de Estoque',
  'Logística',
  'Segurança do Trabalho',
  'Manipulação de Alimentos',
  'Primeiros Socorros'
];

export const AVAILABLE_POSITIONS = [
  'Operador de Caixa',
  'Repositor',
  'Açougueiro',
  'Padeiro',
  'Confeiteiro',
  'Atendente de Frios',
  'Fiscal de Loja',
  'Auxiliar de Limpeza',
  'Estoquista',
  'Motorista',
  'Auxiliar Administrativo',
  'Gerente de Loja',
  'Supervisor de Seção'
];
