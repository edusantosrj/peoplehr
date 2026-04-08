import { supabase } from "@/integrations/supabase/client";
import type {
  CandidateHRData,
  ProcessEvaluation,
  Admission,
  Termination,
  CandidateDocumentation,
  HRAnnotation,
  EmergencyContact,
} from "@/types/hr";
import { createDefaultDocumentation } from "@/types/hr";

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
    talentBank: false,
    ns: false,
    interviewStatus: "Não",
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
        fichaValidation: row.ficha_validation as any,
        managementValidation: row.management_validation as any,
        directorValidation: row.director_validation as any,
        proposalPresented: row.proposal_presented as any,
        proposalAccepted: row.proposal_accepted as any,
        documentationDelivered: row.documentation_delivered as any,
        candidateHired: row.candidate_hired as any,
        talentBank: row.talent_bank,
        ns: row.ns,
        interviewStatus: row.interview_status,
        interviewDate: row.interview_date || undefined,
        interviewAttended: row.interview_attended as any,
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
  const { error } = await supabase.from("hr_evaluations").upsert(
    {
      candidate_id: candidateId,
      ficha_validation: evaluation.fichaValidation,
      management_validation: evaluation.managementValidation,
      director_validation: evaluation.directorValidation,
      proposal_presented: evaluation.proposalPresented,
      proposal_accepted: evaluation.proposalAccepted,
      documentation_delivered: evaluation.documentationDelivered,
      candidate_hired: evaluation.candidateHired,
      talent_bank: evaluation.talentBank,
      ns: evaluation.ns,
      interview_status: evaluation.interviewStatus,
      interview_date: evaluation.interviewDate || null,
      interview_attended: evaluation.interviewAttended || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "candidate_id" }
  );
  if (error) console.error("Erro ao salvar avaliação:", error);
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
  const { error } = await supabase.from("hr_admissions").upsert(
    {
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
    },
    { onConflict: "candidate_id" }
  );
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
