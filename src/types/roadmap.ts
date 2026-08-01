export type RecruitmentStage =
  | "Triagem da Ficha"
  | "Entrevista RH"
  | "Validação Gestor"
  | "Proposta"
  | "Aceite"
  | "Documentação"
  | "Contratação";

export type RoadmapReleaseVersion = "1.1.0" | "1.2.0" | "1.3.0";

export interface RecruitmentPipelineStage {
  id: string;
  title: RecruitmentStage;
  order: number;
  description: string;
}

export interface RecruitmentKanbanBoard {
  id: string;
  title: string;
  position: number;
  candidateIds: string[];
}

export interface ExecutiveMetrics {
  openPositions: number;
  interviewsToday: number;
  averageHiringTimeDays: number;
}

export interface RoadmapRelease {
  version: RoadmapReleaseVersion;
  title: string;
  summary: string;
  pipeline: RecruitmentPipelineStage[];
  kanban: {
    boards: RecruitmentKanbanBoard[];
  };
  executiveDashboard: {
    metrics: ExecutiveMetrics;
  };
}

export interface RoadmapState {
  activeVersion: RoadmapReleaseVersion;
  releases: RoadmapRelease[];
}

export const recruitmentRoadmapReleases: Record<RoadmapReleaseVersion, RoadmapRelease> = {
  "1.1.0": {
    version: "1.1.0",
    title: "Pipeline Completo do Processo Seletivo",
    summary: "Mapeamento claro dos estágios do processo de contratação.",
    pipeline: [
      {
        id: "triagem",
        title: "Triagem da Ficha",
        order: 1,
        description: "Análise inicial da candidatura e validação da documentação.",
      },
      {
        id: "rh-interview",
        title: "Entrevista RH",
        order: 2,
        description: "Entrevista inicial com o time de RH.",
      },
      {
        id: "manager-validation",
        title: "Validação Gestor",
        order: 3,
        description: "Avaliação do candidato pelo gestor responsável.",
      },
      {
        id: "proposal",
        title: "Proposta",
        order: 4,
        description: "Envio da proposta e condições de contratação.",
      },
      {
        id: "acceptance",
        title: "Aceite",
        order: 5,
        description: "Aceite formal da proposta.",
      },
      {
        id: "documentation",
        title: "Documentação",
        order: 6,
        description: "Coleta dos documentos necessários para a contratação.",
      },
      {
        id: "hiring",
        title: "Contratação",
        order: 7,
        description: "Finalização do processo e entrada do novo colaborador.",
      },
    ],
    kanban: {
      boards: [],
    },
    executiveDashboard: {
      metrics: {
        openPositions: 0,
        interviewsToday: 0,
        averageHiringTimeDays: 0,
      },
    },
  },
  "1.2.0": {
    version: "1.2.0",
    title: "Kanban de Recrutamento por Vaga",
    summary: "Estrutura para suportar agrupamento e movimentação de cards por vaga específica.",
    pipeline: [],
    kanban: {
      boards: [
        { id: "todo", title: "Aguardando", position: 1, candidateIds: [] },
        { id: "in-progress", title: "Em andamento", position: 2, candidateIds: [] },
        { id: "done", title: "Contratados", position: 3, candidateIds: [] },
      ],
    },
    executiveDashboard: {
      metrics: {
        openPositions: 0,
        interviewsToday: 0,
        averageHiringTimeDays: 0,
      },
    },
  },
  "1.3.0": {
    version: "1.3.0",
    title: "Dashboard Executivo do RH",
    summary: "Interface para exibição de métricas gerais do recrutamento.",
    pipeline: [],
    kanban: {
      boards: [],
    },
    executiveDashboard: {
      metrics: {
        openPositions: 0,
        interviewsToday: 0,
        averageHiringTimeDays: 0,
      },
    },
  },
};

export const defaultRoadmapState: RoadmapState = {
  activeVersion: "1.1.0",
  releases: Object.values(recruitmentRoadmapReleases),
};