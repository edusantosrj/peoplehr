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
import type { CandidateHRData, HRAnnotation, ProcessEvaluation, Admission, Termination, CandidateDocumentation, EmergencyContact } from "@/types/hr";
import { useToast } from "@/hooks/use-toast";
import { useVacancies } from "@/contexts/VacancyContext";
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

  const handlePrint = async () => {
    setIsPreparingPrint(true);
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

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      window.print();
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar a selfie para impressão.", variant: "destructive" });
    } finally {
      setIsPreparingPrint(false);
    }
  };

  return (
    <div className="space-y-6 print:space-y-3">
      <div className="flex items-center justify-between gap-2 mb-4 print:hidden">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Lista
        </Button>
        <div className="flex items-center gap-2">
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

      <div className="space-y-6">
        <PersonalDataBlock candidate={localCandidate} />
        <AddressBlock candidate={localCandidate} />
        <EducationBlock candidate={localCandidate} />
        <ExperienceBlock experiences={localCandidate.workExperiences} firstJob={localCandidate.firstJob} />
        <AspirationsBlock candidate={localCandidate} />
        <ResumeBlock candidate={localCandidate} />
        <AnnotationsBlock
          annotations={localHRData.annotations}
          onAddAnnotation={handleAddAnnotation}
        />
        <EvaluationBlock
          evaluation={localHRData.evaluation}
          onUpdate={handleUpdateEvaluation}
        />
        <DocumentationBlock
          documentation={localHRData.documentation}
          onUpdate={handleUpdateDocumentation}
        />
        <AdmissionBlock
          admission={localHRData.admission}
          onUpdate={handleUpdateAdmission}
          onBatchUpdate={handleBatchUpdateAdmission}
          onSave={handleSaveAdmission}
          onDebitVacancy={handleDebitVacancy}
        />
        <TerminationBlock
          termination={localHRData.termination}
          onUpdate={handleUpdateTermination}
          onSave={handleSaveTermination}
        />
        <EmergencyContactsBlock
          contacts={localHRData.emergencyContacts || []}
          onUpdate={handleUpdateEmergencyContacts}
        />
        <HistoryBlock
          candidate={localCandidate}
          hrData={localHRData}
        />
      </div>

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
