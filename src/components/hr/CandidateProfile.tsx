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
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData, HRAnnotation, ProcessEvaluation, Admission, Termination, CandidateDocumentation } from "@/types/hr";
import { useToast } from "@/hooks/use-toast";

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
  const [localHRData, setLocalHRData] = useState<CandidateHRData>(hrData);

  const handleAddAnnotation = (text: string) => {
    const newAnnotation: HRAnnotation = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...localHRData,
      annotations: [...localHRData.annotations, newAnnotation],
    };
    setLocalHRData(updated);
    onUpdateHRData(updated);
    toast({
      title: "Anotação adicionada",
      description: "A anotação foi registrada com sucesso.",
    });
  };

  const handleUpdateEvaluation = (field: keyof ProcessEvaluation, value: string | boolean) => {
    const updated = {
      ...localHRData,
      evaluation: {
        ...localHRData.evaluation,
        [field]: value,
      },
    };
    setLocalHRData(updated);
    onUpdateHRData(updated);
  };

  const handleUpdateAdmission = (field: keyof Admission, value: string) => {
    const updated = {
      ...localHRData,
      admission: {
        ...localHRData.admission,
        [field]: value,
      },
    };
    setLocalHRData(updated);
  };

  const handleSaveAdmission = () => {
    onUpdateHRData(localHRData);
    toast({
      title: "Admissão salva",
      description: "Os dados de admissão foram salvos com sucesso.",
    });
  };

  const handleUpdateTermination = (field: keyof Termination, value: string | boolean | number) => {
    const updated = {
      ...localHRData,
      termination: {
        ...localHRData.termination,
        [field]: value,
      },
    };
    setLocalHRData(updated);
  };

  const handleSaveTermination = () => {
    onUpdateHRData(localHRData);
    toast({
      title: "Desligamento salvo",
      description: "Os dados de desligamento foram salvos com sucesso.",
      variant: "destructive",
    });
  };

  const handleUpdateDocumentation = (
    field: keyof CandidateDocumentation,
    key: 'checked' | 'expirationDate' | 'completed',
    value: boolean | string
  ) => {
    const updated = {
      ...localHRData,
      documentation: {
        ...localHRData.documentation,
        [field]: {
          ...localHRData.documentation[field],
          [key]: value,
        },
      },
    };
    setLocalHRData(updated);
    onUpdateHRData(updated);
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
        {/* Bloco 0 - Dados Pessoais */}
        <PersonalDataBlock candidate={candidate} />

        {/* Bloco 1 - Endereço */}
        <AddressBlock candidate={candidate} />

        {/* Bloco 2 - Escolaridade e Cursos */}
        <EducationBlock candidate={candidate} />

        {/* Bloco 3 - Experiências Profissionais */}
        <ExperienceBlock experiences={candidate.workExperiences} />

        {/* Bloco 4 - Pretensões e Disponibilidade */}
        <AspirationsBlock candidate={candidate} />

        {/* Bloco 5 - Currículo */}
        <ResumeBlock candidate={candidate} />

        {/* Bloco 6 - Anotações do RH */}
        <AnnotationsBlock
          annotations={localHRData.annotations}
          onAddAnnotation={handleAddAnnotation}
        />

        {/* Bloco 7 - Avaliação do Processo Seletivo */}
        <EvaluationBlock
          evaluation={localHRData.evaluation}
          onUpdate={handleUpdateEvaluation}
        />

        {/* Bloco 8 - Documentação do Candidato */}
        <DocumentationBlock
          documentation={localHRData.documentation}
          onUpdate={handleUpdateDocumentation}
        />

        {/* Bloco 9 - Admissão do Candidato */}
        <AdmissionBlock
          admission={localHRData.admission}
          onUpdate={handleUpdateAdmission}
          onSave={handleSaveAdmission}
        />

        {/* Bloco 10 - Desligamento do Funcionário */}
        <TerminationBlock
          termination={localHRData.termination}
          onUpdate={handleUpdateTermination}
          onSave={handleSaveTermination}
        />

        {/* Bloco 11 - Histórico de Movimentações */}
        <HistoryBlock
          candidate={candidate}
          hrData={localHRData}
        />
      </div>
    </div>
  );
};
