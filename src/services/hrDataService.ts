import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  CandidateHRData,
  ProcessEvaluation,
  Admission,
  Termination,
  CandidateDocumentation,
  HRAnnotation,
  EmergencyContact,
  PipelineEvent,
  PipelineEventType,
} from "@/types/hr";
import { createDefaultDocumentation } from "@/types/hr";

export function normalizeInterviewStatus(status: string | null | undefined): string {
  if (!status || status === 'Não') return 'Não Agendada';
  if (status === 'Sim') return 'Agendada';
  if (['Não Agendada', 'Agendada', 'Compareceu', 'Não Compareceu', 'Reagendada', 'Cancelada'].includes(status)) {
    return status;
  }
  return 'Não Agendada';
}

const createInitialHRData = (candidateId: string): CandidateHRData => ({
  candidateId,
  annotations: [],
  evaluation: {
    currentStage: "validation_form",
    fichaValidation: "Não Iniciada",
    managementValidation: "Não Iniciada",
    directorValidation: "Não Iniciada",
    proposalPresented: "-",
    proposalAccepted: "-",
    documentationDelivered: "-",
    candidateHired: "-",
    talentBank: false,
    pcd: false,
    ns: false,
    interviewStatus: "Não Agendada",
    interviewTime: "",
    interviewObservation: "",
  },
  admission: {},
  termination: {},
  documentation: createDefaultDocumentation(),
  emergencyContacts: [],
});

export async function fetchAllHRData(
  candidateIds: string[]
): Promise<Record<string, CandidateHRData>> {
  if (candidateIds.length === 0) return {};

  const [evaluations, annotations, admissions, terminations, documentation, contacts] =
    await Promise.all([
      supabase.from("hr_evaluations").select("*").in("candidate_id", candidateIds),
      supabase.from("hr_annotations").select("*").in("candidate_id", candidateIds).order("created_at", { ascending: true }),
      supabase.from("hr_admissions").select("*").in("candidate_id", candidateIds),
      supabase.from("hr_terminations").select("*").in("candidate_id", candidateIds),
      supabase.from("hr_documentation").select("*").in("candidate_id", candidateIds),
      supabase.from("hr_emergency_contacts").select("*").in("candidate_id", candidateIds).order("created_at", { ascending: true }),
    ]);

  const hrMap: Record<string, CandidateHRData> = {};

  for (const id of candidateIds) {
    hrMap[id] = createInitialHRData(id);
  }

  // Map evaluations
  for (const row of evaluations.data || []) {
    const hr = hrMap[row.candidate_id];
    if (hr) {
      hr.evaluation = {
        currentStage: ((row as any).current_stage as any) || 'validation_form',
        fichaValidation: row.ficha_validation as any,
        managementValidation: row.management_validation as any,
        directorValidation: row.director_validation as any,
        proposalPresented: row.proposal_presented as any,
        proposalAccepted: row.proposal_accepted as any,
        documentationDelivered: row.documentation_delivered as any,
        candidateHired: row.candidate_hired as any,
        talentBank: row.talent_bank,
        pcd: (row as any).pcd ?? false,
        ns: row.ns,
        interviewStatus: normalizeInterviewStatus(row.interview_status),
        interviewDate: row.interview_date || undefined,
        interviewAttended: row.interview_attended as any,
        interviewTime: undefined,
        interviewObservation: undefined,
      };
    }
  }

  // Map annotations
  for (const row of annotations.data || []) {
    const hr = hrMap[row.candidate_id];
    if (hr) {
      hr.annotations.push({
        id: row.id,
        text: row.text,
        createdAt: row.created_at,
      });
    }
  }

  // Map admissions
  for (const row of admissions.data || []) {
    const hr = hrMap[row.candidate_id];
    if (hr) {
      hr.admission = {
        vacancyId: row.vacancy_id || undefined,
        vacancyDisplay: row.vacancy_display || undefined,
        admissionStatus: row.admission_status || undefined,
        definedSalary: row.defined_salary || undefined,
        storeUnit: row.store_unit || undefined,
        workHours: row.work_hours || undefined,
        expectedStartDate: row.expected_start_date || undefined,
        observations: row.observations || undefined,
        hiredAt: row.hired_at || undefined,
      };
    }
  }

  // Map terminations
  for (const row of terminations.data || []) {
    const hr = hrMap[row.candidate_id];
    if (hr) {
      hr.termination = {
        requestDate: row.request_date || undefined,
        voluntaryTermination: row.voluntary_termination ?? undefined,
        terminationReason: row.termination_reason || undefined,
        willServeNotice: row.will_serve_notice ?? undefined,
        noticeDays: row.notice_days ?? undefined,
        lastWorkDay: row.last_work_day || undefined,
        canBeRehired: row.can_be_rehired ?? undefined,
        confirmed: row.confirmed ?? undefined,
      };
    }
  }

  // Map documentation
  for (const row of documentation.data || []) {
    const hr = hrMap[row.candidate_id];
    if (hr) {
      hr.documentation = {
        basicDocumentation: {
          checked: row.basic_doc_checked,
          expirationDate: row.basic_doc_expiration_date || undefined,
          completed: row.basic_doc_completed ?? undefined,
        },
        experienceContract: {
          checked: row.experience_contract_checked,
          expirationDate: row.experience_contract_expiration_date || undefined,
          completed: row.experience_contract_completed ?? undefined,
        },
        experienceExtension: {
          checked: row.experience_extension_checked,
          expirationDate: row.experience_extension_expiration_date || undefined,
          completed: row.experience_extension_completed ?? undefined,
        },
        priorNotice: {
          checked: row.prior_notice_checked,
          expirationDate: row.prior_notice_expiration_date || undefined,
          completed: row.prior_notice_completed ?? undefined,
        },
        terminationContract: {
          checked: row.termination_contract_checked,
          expirationDate: row.termination_contract_expiration_date || undefined,
          completed: row.termination_contract_completed ?? undefined,
        },
      };
    }
  }

  // Map emergency contacts
  for (const row of contacts.data || []) {
    const hr = hrMap[row.candidate_id];
    if (hr) {
      hr.emergencyContacts.push({
        id: row.id,
        name: row.name,
        relationship: row.relationship,
        phone: row.phone,
      });
    }
  }

  return hrMap;
}

export async function saveEvaluation(candidateId: string, evaluation: ProcessEvaluation) {
  const payload = {
    candidate_id: candidateId,
    current_stage: evaluation.currentStage,
    ficha_validation: evaluation.fichaValidation,
    management_validation: evaluation.managementValidation,
    director_validation: evaluation.directorValidation,
    proposal_presented: evaluation.proposalPresented,
    proposal_accepted: evaluation.proposalAccepted,
    documentation_delivered: evaluation.documentationDelivered,
    candidate_hired: evaluation.candidateHired,
    talent_bank: evaluation.talentBank,
    pcd: evaluation.pcd,
    ns: evaluation.ns,
    interview_status: evaluation.interviewStatus,
    interview_date: evaluation.interviewDate || null,
    interview_attended: evaluation.interviewAttended || null,
    updated_at: new Date().toISOString(),
  };

  console.log("Início de saveEvaluation:", candidateId);
  console.log("Payload enviado:", payload);

  const res = await supabase.from("hr_evaluations").upsert(
    payload,
    { onConflict: "candidate_id" }
  );

  console.log("Resposta completa do Supabase:", res);

  const { error } = res;
  if (error) {
    console.error("Erro ao salvar avaliação:");
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
    if (error.code) console.error("Code:", error.code);
    if (error.message) console.error("Message:", error.message);
    if (error.details) console.error("Details:", error.details);
    if (error.hint) console.error("Hint:", error.hint);
    if ((error as any).status) console.error("Status:", (error as any).status);
  }
  return !error;
}

export async function addAnnotation(candidateId: string, text: string): Promise<HRAnnotation | null> {
  const { data, error } = await supabase
    .from("hr_annotations")
    .insert({ candidate_id: candidateId, text })
    .select()
    .single();
  if (error) {
    console.error("Erro ao salvar anotação:", error);
    return null;
  }
  return { id: data.id, text: data.text, createdAt: data.created_at };
}

export async function saveAdmission(candidateId: string, admission: Admission) {
  type AdmissionInsert = Database["public"]["Tables"]["hr_admissions"]["Insert"];
  const payload: AdmissionInsert = {
    candidate_id: candidateId,
    vacancy_id: admission.vacancyId || null,
    vacancy_display: admission.vacancyDisplay || null,
    admission_status: admission.admissionStatus || null,
    defined_salary: admission.definedSalary || null,
    store_unit: admission.storeUnit || null,
    work_hours: admission.workHours || null,
    expected_start_date: admission.expectedStartDate || null,
    observations: admission.observations || null,
    updated_at: new Date().toISOString(),
  };

  // hired_at é gerenciado exclusivamente por transitionToHired.
  // Preserva o valor existente no banco quando salvar admissão pela interface.
  if (admission.hiredAt) {
    payload.hired_at = admission.hiredAt;
  }

  const { error } = await supabase.from("hr_admissions").upsert(payload, {
    onConflict: "candidate_id",
  });
  if (error) console.error("Erro ao salvar admissão:", error);
  return !error;
}

export async function saveTermination(candidateId: string, termination: Termination) {
  const { error } = await supabase.from("hr_terminations").upsert(
    {
      candidate_id: candidateId,
      request_date: termination.requestDate || null,
      voluntary_termination: termination.voluntaryTermination ?? null,
      termination_reason: termination.terminationReason || null,
      will_serve_notice: termination.willServeNotice ?? null,
      notice_days: termination.noticeDays ?? null,
      last_work_day: termination.lastWorkDay || null,
      can_be_rehired: termination.canBeRehired ?? null,
      confirmed: termination.confirmed ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "candidate_id" }
  );
  if (error) console.error("Erro ao salvar desligamento:", error);
  return !error;
}

export async function saveDocumentation(candidateId: string, doc: CandidateDocumentation) {
  const { error } = await supabase.from("hr_documentation").upsert(
    {
      candidate_id: candidateId,
      basic_doc_checked: doc.basicDocumentation.checked,
      basic_doc_expiration_date: doc.basicDocumentation.expirationDate || null,
      basic_doc_completed: doc.basicDocumentation.completed ?? false,
      experience_contract_checked: doc.experienceContract.checked,
      experience_contract_expiration_date: doc.experienceContract.expirationDate || null,
      experience_contract_completed: doc.experienceContract.completed ?? false,
      experience_extension_checked: doc.experienceExtension.checked,
      experience_extension_expiration_date: doc.experienceExtension.expirationDate || null,
      experience_extension_completed: doc.experienceExtension.completed ?? false,
      prior_notice_checked: doc.priorNotice.checked,
      prior_notice_expiration_date: doc.priorNotice.expirationDate || null,
      prior_notice_completed: doc.priorNotice.completed ?? false,
      termination_contract_checked: doc.terminationContract.checked,
      termination_contract_expiration_date: doc.terminationContract.expirationDate || null,
      termination_contract_completed: doc.terminationContract.completed ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "candidate_id" }
  );
  if (error) console.error("Erro ao salvar documentação:", error);
  return !error;
}

export async function saveEmergencyContacts(candidateId: string, contacts: EmergencyContact[]) {
  // Delete existing and re-insert
  const { error: deleteError } = await supabase
    .from("hr_emergency_contacts")
    .delete()
    .eq("candidate_id", candidateId);
  if (deleteError) {
    console.error("Erro ao limpar contatos:", deleteError);
    return false;
  }

  if (contacts.length === 0) return true;

  const rows = contacts.map((c) => ({
    candidate_id: candidateId,
    name: c.name,
    relationship: c.relationship,
    phone: c.phone,
  }));

  const { error } = await supabase.from("hr_emergency_contacts").insert(rows);
  if (error) {
    console.error("Erro ao salvar contatos:", error);
    return false;
  }
  return true;
}

// ============================================================
// PIPELINE CONTRATADO — ETAPA 4.1
// ============================================================
// Centralização futura da transição de candidato para "Contratado".
// Esta camada prepara a arquitetura; a interface atual continuará
// funcionando normalmente até a Etapa 4.3.

/**
 * Parâmetros da operação transitionToHired.
 */
export interface TransitionToHiredParams {
  candidateId: string;
  /** Data da contratação. Default: agora. */
  hiredAt?: string;
  /** Tipo do evento registrado na auditoria. Default: 'hired'. */
  eventType?: PipelineEventType;
  /**
   * PONTO DE INTEGRAÇÃO COM debitVacancy — Etapa 4.3.
   *
   * HOJE: o débito de vaga é feito diretamente pela interface em
   * CandidateProfile.handleSaveAdmission (fluxo antigo). Este callback
   * não é chamado por esse fluxo.
   *
   * FUTURO: quando este serviço for a única porta de entrada para
   * contratação, deverá ser passado aqui o `debitVacancy` do
   * VacancyContext. Ele só será executado APÓS a contratação realmente
   * acontecer (status 'hired'), garantindo idempotência — nunca será
   * chamado para candidatos já contratados.
   */
  debitVacancy?: (vacancyId: string) => Promise<boolean>;
}

export type TransitionToHiredResult =
  | {
      status: 'already_hired';
      hiredAt?: string;
    }
  | {
      status: 'hired';
      hiredAt: string;
      event: PipelineEvent;
      vacancyDebited: boolean;
    }
  | {
      status: 'error';
      error: string;
    };

/**
 * Registra um evento de auditoria em hr_pipeline_events.
 * created_by é preenchido a partir da sessão autenticada.
 */
export async function registerPipelineEvent(params: {
  candidateId: string;
  fromStage?: string | null;
  toStage: string;
  eventType: PipelineEventType | string;
}): Promise<PipelineEvent | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  type PipelineEventInsert =
    Database["public"]["Tables"]["hr_pipeline_events"]["Insert"];

  const payload: PipelineEventInsert = {
    candidate_id: params.candidateId,
    from_stage: params.fromStage ?? null,
    to_stage: params.toStage,
    event_type: params.eventType,
    created_by: session?.user?.id ?? null,
  };

  const { data, error } = await supabase
    .from("hr_pipeline_events")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Erro ao registrar evento do pipeline:", error);
    return null;
  }

  return {
    id: data.id,
    candidateId: data.candidate_id,
    fromStage: data.from_stage,
    toStage: data.to_stage,
    eventType: data.event_type,
    createdBy: data.created_by,
    createdAt: data.created_at,
  };
}

/**
 * Busca o histórico real de eventos do pipeline de um candidato.
 * Fonte de verdade para auditoria (hr_pipeline_events).
 */
export async function fetchPipelineEvents(
  candidateId: string
): Promise<PipelineEvent[]> {
  const { data, error } = await supabase
    .from("hr_pipeline_events")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar eventos do pipeline:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    candidateId: row.candidate_id,
    fromStage: row.from_stage,
    toStage: row.to_stage,
    eventType: row.event_type,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }));
}

/**
 * transitionToHired — ÚNICA PUERTA DE ENTRADA PARA CONTRATACIÓN (Etapa 4.3).
 *
 * Delega toda la lógica transaccional a la RPC public.transition_to_hired,
 * que es la autoridad atómica de la contratación:
 *  - valida el candidato;
 *  - verifica si ya está contratado (idempotencia);
 *  - actualiza hr_admissions y hr_evaluations;
 *  - registra hr_pipeline_events;
 *  - debita la vaga en la misma transacción.
 *
 * El frontend NO debe ejecutar debitVacancy() en el camino de contratación.
 */
export async function transitionToHired(
  params: TransitionToHiredParams
): Promise<TransitionToHiredResult> {
  const { candidateId } = params;

  const { data, error } = await supabase.rpc("transition_to_hired", {
    p_candidate_id: candidateId,
  });

  if (error) {
    console.error("Error en transition_to_hired RPC:", error);
    return { status: "error", error: error.message || "Fallo al contratar candidato." };
  }

  const result = data as {
    status?: string;
    hiredAt?: string;
    eventId?: string;
    vacancyDebited?: boolean;
    error?: string;
  } | null;

  if (!result) {
    return { status: "error", error: "Respuesta vacía de la RPC." };
  }

  if (result.status === "already_hired") {
    return {
      status: "already_hired",
      hiredAt: result.hiredAt,
    };
  }

  if (result.status === "error") {
    return { status: "error", error: result.error || "Error desconocido." };
  }

  if (result.status === "hired") {
    return {
      status: "hired",
      hiredAt: result.hiredAt || new Date().toISOString(),
      event: {
        id: result.eventId || "",
        candidateId,
        fromStage: undefined,
        toStage: "hired",
        eventType: "hired",
        createdAt: result.hiredAt || new Date().toISOString(),
      },
      vacancyDebited: !!result.vacancyDebited,
    };
  }

  return { status: "error", error: "Estado inesperado de la RPC." };
}
