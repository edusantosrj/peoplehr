import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepIndicator } from "./StepIndicator";
import { Step1PersonalData } from "./steps/Step1PersonalData";
import { Step2Education } from "./steps/Step2Education";
import { Step3Background } from "./steps/Step3Background";
import { Step4Experience } from "./steps/Step4Experience";
import { Step5Aspirations } from "./steps/Step5Aspirations";
import { Step6Uploads } from "./steps/Step6Uploads";
import { Step7LGPD } from "./steps/Step7LGPD";
import { SuccessScreen } from "./SuccessScreen";
import { WorkExperience } from "@/types/candidate";
import { parseDate } from "@/utils/cpfValidation";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { toast } from "sonner";

interface CandidateFormProps {
  cpf: string;
  onSubmit: (data: FormData) => Promise<void>;
}

interface FormData {
  cpf: string;
  fullName: string;
  birthDate: string;
  maritalStatus: string;
  motherName: string;
  fatherName: string;
  whatsapp: string;
  address: string;
  addressNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  instagram: string;
  facebook: string;
  education: string;
  course: string;
  period: string;
  hasTechnicalCourse: boolean;
  completedCourses: string[];
  otherCourses: string;
  hasCriminalRecord: boolean;
  workExperiences: WorkExperience[];
  salaryExpectation: string;
  immediateStart: boolean;
  availableWeekends: boolean;
  availableHolidays: boolean;
  desiredPosition1: string;
  desiredPosition2: string;
  desiredPosition3: string;
  resumeFile: File | null;
  otherFiles: File[];
  selfieFile: File | null;
  lgpdConsent: boolean;
}

const STEP_LABELS = [
  "Dados",
  "Escolaridade",
  "Antecedentes",
  "Experiência",
  "Pretensões",
  "Arquivos",
  "LGPD"
];

const initialFormData: FormData = {
  cpf: "",
  fullName: "",
  birthDate: "",
  maritalStatus: "",
  motherName: "",
  fatherName: "",
  whatsapp: "",
  address: "",
  addressNumber: "",
  neighborhood: "",
  city: "",
  state: "",
  instagram: "",
  facebook: "",
  education: "",
  course: "",
  period: "",
  hasTechnicalCourse: false,
  completedCourses: [],
  otherCourses: "",
  hasCriminalRecord: false,
  workExperiences: [],
  salaryExpectation: "",
  immediateStart: false,
  availableWeekends: false,
  availableHolidays: false,
  desiredPosition1: "",
  desiredPosition2: "",
  desiredPosition3: "",
  resumeFile: null,
  otherFiles: [],
  selfieFile: null,
  lgpdConsent: false
};

export function CandidateForm({ cpf, onSubmit }: CandidateFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({ ...initialFormData, cpf });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = "Nome é obrigatório";
        if (!formData.birthDate) {
          newErrors.birthDate = "Data de nascimento é obrigatória";
        } else {
          const parsed = parseDate(formData.birthDate);
          if (!parsed) {
            newErrors.birthDate = "Data inválida";
          } else {
            const today = new Date();
            if (parsed > today) {
              newErrors.birthDate = "Data de nascimento não pode ser futura";
            } else if (parsed.getFullYear() < 1900) {
              newErrors.birthDate = "Data de nascimento inválida";
            }
          }
        }
        if (!formData.maritalStatus) newErrors.maritalStatus = "Estado civil é obrigatório";
        if (!formData.motherName.trim()) newErrors.motherName = "Nome da mãe é obrigatório";
        if (!formData.whatsapp || formData.whatsapp.replace(/\D/g, '').length < 11) {
          newErrors.whatsapp = "WhatsApp inválido";
        }
        if (!formData.address.trim()) newErrors.address = "Endereço é obrigatório";
        if (!formData.addressNumber.trim()) newErrors.addressNumber = "Número é obrigatório";
        if (!formData.neighborhood.trim()) newErrors.neighborhood = "Bairro é obrigatório";
        if (!formData.city.trim()) newErrors.city = "Cidade é obrigatória";
        if (!formData.state) newErrors.state = "Estado é obrigatório";
        break;

      case 2:
        if (!formData.education) newErrors.education = "Escolaridade é obrigatória";
        if (['Superior Completo', 'Pós-Graduação Completa'].includes(formData.education)) {
          if (!formData.course.trim()) newErrors.course = "Curso é obrigatório";
        }
        if (['Superior Incompleto', 'Pós-Graduação Incompleta'].includes(formData.education)) {
          if (!formData.course.trim()) newErrors.course = "Curso é obrigatório";
          if (!formData.period.trim()) newErrors.period = "Período é obrigatório";
        }
        break;

      case 5:
        if (!formData.salaryExpectation) newErrors.salaryExpectation = "Pretensão salarial é obrigatória";
        if (!formData.desiredPosition1) newErrors.desiredPosition1 = "Selecione ao menos uma vaga";
        break;

      case 6:
        if (!formData.resumeFile) newErrors.resumeFile = "Currículo é obrigatório";
        if (!formData.selfieFile) newErrors.selfieFile = "Selfie é obrigatória";
        break;

      case 7:
        if (!formData.lgpdConsent) newErrors.lgpdConsent = "Você deve aceitar os termos para continuar";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 7) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      toast.error("Por favor, corrija os campos destacados");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (validateStep(7)) {
      try {
        await onSubmit(formData);
        setIsSubmitted(true);
        toast.success("Cadastro realizado com sucesso!");
      } catch {
        // Error already handled in onSubmit
      }
    }
  };

  if (isSubmitted) {
    return <SuccessScreen />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PersonalData data={formData} onChange={updateField} errors={errors} />;
      case 2:
        return <Step2Education data={formData} onChange={updateField} errors={errors} />;
      case 3:
        return <Step3Background data={formData} onChange={updateField} />;
      case 4:
        return <Step4Experience data={formData} onChange={updateField} errors={errors} />;
      case 5:
        return <Step5Aspirations data={formData} onChange={updateField} errors={errors} />;
      case 6:
        return <Step6Uploads data={formData} onChange={updateField} errors={errors} />;
      case 7:
        return <Step7LGPD data={formData} onChange={updateField} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <StepIndicator 
        currentStep={currentStep} 
        totalSteps={7} 
        stepLabels={STEP_LABELS}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">
            Etapa {currentStep}: {STEP_LABELS[currentStep - 1]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep < 7 ? (
              <Button type="button" onClick={handleNext}>
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit}>
                Enviar Cadastro
                <Send className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
