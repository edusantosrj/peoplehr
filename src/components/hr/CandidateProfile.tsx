import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
  const { debitVacancy } = useVacancies();
  const [localHRData, setLocalHRData] = useState<CandidateHRData>(hrData);

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
    const updated = {
      ...localHRData,
      admission: { ...localHRData.admission, [field]: value },
    };
    setLocalHRData(updated);
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
    const updated = {
      ...localHRData,
      termination: { ...localHRData.termination, [field]: value },
    };
    setLocalHRData(updated);
  };

  const handleSaveTermination = async () => {
    updateLocal(localHRData);
    const ok = await saveTermination(candidate.id, localHRData.termination);
    if (ok) {
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

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Lista
      </Button>

      <CandidateProfileHeader
        photoUrl={localHRData.photoUrl}
        fullName={candidate.fullName}
        cpf={candidate.cpf}
        registrationDate={candidate.registrationDate}
      />

      <div className="space-y-6">
        <PersonalDataBlock candidate={candidate} />
        <AddressBlock candidate={candidate} />
        <EducationBlock candidate={candidate} />
        <ExperienceBlock experiences={candidate.workExperiences} />
        <AspirationsBlock candidate={candidate} />
        <ResumeBlock candidate={candidate} />
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
          candidate={candidate}
          hrData={localHRData}
        />
      </div>
    </div>
  );
};
