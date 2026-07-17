import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Printer, Pencil, Share2, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { CandidateEditDialog } from "./CandidateEditDialog";
import { CandidateCardDialog } from "./CandidateCardDialog";
import { CandidateProfileHeader } from "./CandidateProfileHeader";
import { PersonalDataBlock } from "./blocks/PersonalDataBlock";
import { AddressBlock } from "./blocks/AddressBlock";
import { EducationBlock } from "./blocks/EducationBlock";
import { ExperienceBlock } from "./blocks/ExperienceBlock";
import { AspirationsBlock } from "./blocks/AspirationsBlock";
import { ResumeBlock } from "./blocks/ResumeBlock";
import { AnnotationsBlock } from "./blocks/AnnotationsBlock";
import { EvaluationBlock } from "./blocks/EvaluationBlock";
import { AdmissionBlock } from "./blocks/AdmissionBlock";
import { TerminationBlock } from "./blocks/TerminationBlock";
import { DocumentationBlock } from "./blocks/DocumentationBlock";
import { HistoryBlock } from "./blocks/HistoryBlock";
import { EmergencyContactsBlock } from "./blocks/EmergencyContactsBlock";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData, HRAnnotation, ProcessEvaluation, Admission, Termination, CandidateDocumentation, EmergencyContact, DocumentItem } from "@/types/hr";
import { useToast } from "@/hooks/use-toast";
import { useVacancies } from "@/contexts/VacancyContext";
import { formatDateDisplay } from "@/utils/textFormatting";
import {
  saveEvaluation,
  addAnnotation,
  saveAdmission,
  saveTermination,
  saveDocumentation,
  saveEmergencyContacts,
} from "@/services/hrDataService";
import { getSignedStorageUrl, useSignedStorageUrl } from "@/lib/storagePath";

interface CandidateProfileProps {
  candidate: Candidate;
  hrData: CandidateHRData;
  onBack: () => void;
  onUpdateHRData: (data: CandidateHRData) => void;
}

export const CandidateProfile = ({
  candidate,
  hrData,
  onBack,
  onUpdateHRData,
}: CandidateProfileProps) => {
  const { toast } = useToast();
  const { debitVacancy, creditVacancy } = useVacancies();
  const [localHRData, setLocalHRData] = useState<CandidateHRData>(hrData);
  const [localCandidate, setLocalCandidate] = useState<Candidate>(candidate);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);

  const ALL_SECTIONS = [
    "personal", "address", "education", "experience", "aspirations",
    "resume", "annotations", "evaluation", "documentation",
    "admission", "termination", "emergency", "history",
  ];
  const expandAll = () => setOpenSections(ALL_SECTIONS);
  const collapseAll = () => setOpenSections([]);

  const updateLocal = (updated: CandidateHRData) => {
    setLocalHRData(updated);
    onUpdateHRData(updated);
  };

  const handleAddAnnotation = async (text: string) => {
    const saved = await addAnnotation(candidate.id, text);
    if (saved) {
      const updated = {
        ...localHRData,
        annotations: [...localHRData.annotations, saved],
      };
      updateLocal(updated);
      toast({ title: "Anotação adicionada", description: "A anotação foi registrada com sucesso." });
    } else {
      toast({ title: "Erro", description: "Não foi possível salvar a anotação.", variant: "destructive" });
    }
  };

  const handleUpdateEvaluation = async (field: keyof ProcessEvaluation, value: string | boolean) => {
    const newEvaluation = { ...localHRData.evaluation, [field]: value };
    const updated = { ...localHRData, evaluation: newEvaluation };
    updateLocal(updated);
    const ok = await saveEvaluation(candidate.id, newEvaluation);
    if (!ok) {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar a avaliação.", variant: "destructive" });
    }
  };

  const handleUpdateAdmission = (field: keyof Admission, value: string) => {
    setLocalHRData((prev) => ({
      ...prev,
      admission: { ...prev.admission, [field]: value },
    }));
  };

  const handleBatchUpdateAdmission = (updates: Partial<Admission>) => {
    setLocalHRData((prev) => ({
      ...prev,
      admission: { ...prev.admission, ...updates },
    }));
  };

  const handleDebitVacancy = async (vacancyId: string) => {
    const success = await debitVacancy(vacancyId);
    if (!success) {
      toast({ title: "Erro", description: "Não foi possível debitar a vaga. Quantidade insuficiente.", variant: "destructive" });
    }
  };

  const handleSaveAdmission = async () => {
    // Debit vacancy when status changes to "Contratado" and vacancy is selected
    const previousStatus = hrData.admission?.admissionStatus;
    const newStatus = localHRData.admission?.admissionStatus;
    if (newStatus === 'Contratado' && previousStatus !== 'Contratado' && localHRData.admission?.vacancyId) {
      const success = await debitVacancy(localHRData.admission.vacancyId);
      if (!success) {
        toast({ title: "Vaga indisponível", description: "Não foi possível contratar. A vaga não possui mais vagas disponíveis.", variant: "destructive" });
        return;
      }
    }
    updateLocal(localHRData);
    const ok = await saveAdmission(candidate.id, localHRData.admission);
    if (ok) {
      toast({ title: "Admissão salva", description: "Os dados de admissão foram salvos com sucesso." });
    } else {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar a admissão.", variant: "destructive" });
    }
  };

  const handleUpdateTermination = (field: keyof Termination, value: string | boolean | number) => {
    setLocalHRData((prev) => ({
      ...prev,
      termination: { ...prev.termination, [field]: value },
    }));
  };

  const handleSaveTermination = async () => {
    const wasConfirmed = hrData.termination?.confirmed === true;
    const isConfirmed = localHRData.termination?.confirmed === true;
    updateLocal(localHRData);
    const ok = await saveTermination(candidate.id, localHRData.termination);
    if (ok) {
      // Credit back the vacancy when termination is confirmed for the first time
      if (isConfirmed && !wasConfirmed && localHRData.admission?.vacancyId) {
        const credited = await creditVacancy(localHRData.admission.vacancyId);
        if (credited) {
          toast({ title: "Vaga reaberta", description: "A vaga foi incrementada (+1) e marcada como Ativa." });
        }
      }
      toast({ title: "Desligamento salvo", description: "Os dados de desligamento foram salvos com sucesso.", variant: "destructive" });
    } else {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar o desligamento.", variant: "destructive" });
    }
  };

  const handleUpdateDocumentation = async (
    field: keyof CandidateDocumentation,
    key: 'checked' | 'expirationDate' | 'completed',
    value: boolean | string
  ) => {
    const newDoc = {
      ...localHRData.documentation,
      [field]: { ...localHRData.documentation[field], [key]: value },
    };
    const updated = { ...localHRData, documentation: newDoc };
    updateLocal(updated);
    const ok = await saveDocumentation(candidate.id, newDoc);
    if (!ok) {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar a documentação.", variant: "destructive" });
    }
  };

  const handleUpdateEmergencyContacts = async (contacts: EmergencyContact[]) => {
    const updated = { ...localHRData, emergencyContacts: contacts };
    updateLocal(updated);
    const ok = await saveEmergencyContacts(candidate.id, contacts);
    if (!ok) {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar os contatos.", variant: "destructive" });
    }
  };

  const signedSelfieUrl = useSignedStorageUrl("selfies", localCandidate.selfieUrl);

  const formatCurrency = (value: string) => {
    const amount = Number(value.replace(/[^\d,-]/g, '').replace(',', '.'));
    if (isNaN(amount)) return value;
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const personalSummary = (() => {
    const name = localCandidate.fullName || '';
    const nickname = localCandidate.nickname;
    const gender = localCandidate.gender;
    if (nickname) {
      return `${nickname} (${name})${gender ? ` • ${gender}` : ''}`;
    }
    return `${name}${gender ? ` • ${gender}` : ''}`;
  })();

  const addressSummary = `${localCandidate.neighborhood || ''} • ${localCandidate.city || ''}/${localCandidate.state || ''}`;

  const educationSummary = (() => {
    const education = localCandidate.education || '';
    const courses = localCandidate.completedCourses || [];
    if (!localCandidate.hasTechnicalCourse || courses.length === 0) return education;
    if (courses.length === 1) return `${education} • Técnico em ${courses[0]}`;
    return `${education} • Curso Técnico (+${courses.length})`;
  })();

  const experienceSummary = (() => {
    if (localCandidate.firstJob) return 'Primeiro Emprego';
    const count = localCandidate.workExperiences?.length || 0;
    const currently = localCandidate.workExperiences?.some((exp) => exp.currentlyWorking);
    const base = count === 1 ? '1 experiência cadastrada' : `${count} experiências cadastradas`;
    return currently ? `${base} • Empregado atualmente` : base;
  })();

  const aspirationsSummary = (() => {
    const positions = [localCandidate.desiredPosition1, localCandidate.desiredPosition2, localCandidate.desiredPosition3].filter(Boolean);
    const salary = localCandidate.salaryExpectation ? formatCurrency(localCandidate.salaryExpectation) : '';
    if (positions.length === 0) return salary || '';
    const extra = positions.length > 1 ? ` (+${positions.length - 1})` : '';
    return `${positions[0]}${extra}${salary ? ` • ${salary}` : ''}`;
  })();

  const resumeSummary = (() => {
    const parts: string[] = [];
    if (localCandidate.selfieUrl) parts.push('Selfie');
    if (localCandidate.resumeUrl) parts.push('Currículo');
    else if (localCandidate.selfieUrl) parts.push('Sem Currículo');
    const extras = localCandidate.otherFilesUrls?.length || 0;
    if (extras > 0) parts.push(`${extras} anexo${extras === 1 ? '' : 's'}`);
    return parts.join(' • ');
  })();

  const evaluationSummary = (() => {
    if (localHRData.admission?.admissionStatus === 'Contratado') return 'Contratado';
    if (localHRData.termination?.confirmed) return 'Demitido';
    if (localHRData.evaluation?.talentBank) return 'Banco de Talentos';
    if (localHRData.evaluation?.interviewDate) {
      return `Entrevista Agendada • ${formatDateDisplay(localHRData.evaluation.interviewDate)}`;
    }
    return 'Em Processo Seletivo';
  })();

  const documentationSummary = (() => {
    const docs = localHRData.documentation || {};
    const values = Object.values(docs) as DocumentItem[];
    const total = values.filter((d) => d?.completed).length;
    const count = values.length;
    if (total === count && count > 0) return `${total} documentos concluídos`;
    return 'Documentação pendente';
  })();

  const handlePrint = async () => {
    setIsPreparingPrint(true);
    const previousOpen = openSections;
    setOpenSections(ALL_SECTIONS);
    try {
      if (localCandidate.selfieUrl) {
        const url = await getSignedStorageUrl("selfies", localCandidate.selfieUrl);
        if (url) {
          await new Promise<void>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve();
            image.onerror = () => reject(new Error("selfie-load-error"));
            image.src = url;
          });
        }
      }

      // Aguarda dois frames para o Radix Accordion terminar de expandir.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      window.print();
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar a selfie para impressão.", variant: "destructive" });
    } finally {
      setIsPreparingPrint(false);
      setOpenSections(previousOpen);
    }
  };

  return (
    <div className="space-y-6 print:space-y-3">
      <div className="flex items-center justify-between gap-2 mb-4 print:hidden">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Lista
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={expandAll}>
            <ChevronsUpDown className="h-4 w-4 mr-2" />
            Expandir Todos
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            <ChevronsDownUp className="h-4 w-4 mr-2" />
            Recolher Todos
          </Button>
          <Button variant="default" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar Ficha do Candidato
          </Button>
          <Button variant="secondary" onClick={() => setCardOpen(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Gerar Card
          </Button>
          <Button variant="outline" onClick={handlePrint} disabled={isPreparingPrint}>
            <Printer className="h-4 w-4 mr-2" />
            {isPreparingPrint ? "Preparando impressão..." : "Impressão Ficha Candidato"}
          </Button>
        </div>
      </div>

      <CandidateProfileHeader
        photoUrl={signedSelfieUrl}
        fullName={localCandidate.fullName}
        cpf={localCandidate.cpf}
        registrationDate={localCandidate.registrationDate}
      />

      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={setOpenSections}
        className="space-y-3 print:space-y-3"
      >
        <AccordionItem value="personal" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">
            <span className="flex items-center gap-2 flex-1 min-w-0">
              <span className="shrink-0">Dados Pessoais</span>
              {personalSummary && <span className="text-sm text-muted-foreground truncate">{personalSummary}</span>}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><PersonalDataBlock candidate={localCandidate} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="address" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">
            <span className="flex items-center gap-2 flex-1 min-w-0">
              <span className="shrink-0">Endereço</span>
              <span className="text-sm text-muted-foreground truncate">{addressSummary}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><AddressBlock candidate={localCandidate} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="education" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">
            <span className="flex items-center gap-2 flex-1 min-w-0">
              <span className="shrink-0">Escolaridade e Cursos</span>
              <span className="text-sm text-muted-foreground truncate">{educationSummary}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><EducationBlock candidate={localCandidate} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="experience" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">
            <span className="flex items-center gap-2 flex-1 min-w-0">
              <span className="shrink-0">Experiência Profissional</span>
              <span className="text-sm text-muted-foreground truncate">{experienceSummary}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><ExperienceBlock experiences={localCandidate.workExperiences} firstJob={localCandidate.firstJob} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="aspirations" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">
            <span className="flex items-center gap-2 flex-1 min-w-0">
              <span className="shrink-0">Pretensões</span>
              {aspirationsSummary && <span className="text-sm text-muted-foreground truncate">{aspirationsSummary}</span>}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><AspirationsBlock candidate={localCandidate} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="resume" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">
            <span className="flex items-center gap-2 flex-1 min-w-0">
              <span className="shrink-0">Arquivos</span>
              {resumeSummary && <span className="text-sm text-muted-foreground truncate">{resumeSummary}</span>}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><ResumeBlock candidate={localCandidate} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="annotations" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">Anotações do RH</AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><AnnotationsBlock annotations={localHRData.annotations} onAddAnnotation={handleAddAnnotation} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="evaluation" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">
            <span className="flex items-center gap-2 flex-1 min-w-0">
              <span className="shrink-0">Avaliação do Processo Seletivo</span>
              <span className="text-sm text-muted-foreground truncate">{evaluationSummary}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><EvaluationBlock evaluation={localHRData.evaluation} onUpdate={handleUpdateEvaluation} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="documentation" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">
            <span className="flex items-center gap-2 flex-1 min-w-0">
              <span className="shrink-0">Documentação</span>
              <span className="text-sm text-muted-foreground truncate">{documentationSummary}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><DocumentationBlock documentation={localHRData.documentation} onUpdate={handleUpdateDocumentation} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="admission" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">Admissão do Candidato</AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><AdmissionBlock admission={localHRData.admission} onUpdate={handleUpdateAdmission} onBatchUpdate={handleBatchUpdateAdmission} onSave={handleSaveAdmission} onDebitVacancy={handleDebitVacancy} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="termination" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">Desligamento</AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><TerminationBlock termination={localHRData.termination} onUpdate={handleUpdateTermination} onSave={handleSaveTermination} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="emergency" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">Contatos de Emergência</AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><EmergencyContactsBlock contacts={localHRData.emergencyContacts || []} onUpdate={handleUpdateEmergencyContacts} /></AccordionContent>
        </AccordionItem>
        <AccordionItem value="history" className="border rounded-lg bg-card px-4 print:border-0 print:px-0">
          <AccordionTrigger className="text-base font-semibold hover:no-underline print:hidden">Histórico</AccordionTrigger>
          <AccordionContent className="pt-2 print:!block"><HistoryBlock candidate={localCandidate} hrData={localHRData} /></AccordionContent>
        </AccordionItem>
      </Accordion>

      <CandidateEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        candidate={localCandidate}
        onSaved={(updated) => setLocalCandidate(updated)}
      />

      <CandidateCardDialog
        open={cardOpen}
        onOpenChange={setCardOpen}
        candidate={localCandidate}
        hrData={localHRData}
      />
    </div>
  );
};
