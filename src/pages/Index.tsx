import { useState } from "react";
import { CpfPreCheck } from "@/components/candidate/CpfPreCheck";
import { CandidateForm } from "@/components/candidate/CandidateForm";
import { VacancyProvider } from "@/contexts/VacancyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [validatedCpf, setValidatedCpf] = useState<string | null>(null);

  const handleCpfValidated = (cpf: string) => {
    setValidatedCpf(cpf);
  };

  const handleFormSubmit = async (data: any) => {
    const { error } = await supabase.from("candidates").insert({
      cpf: data.cpf,
      full_name: data.fullName,
      birth_date: data.birthDate,
      marital_status: data.maritalStatus,
      mother_name: data.motherName,
      father_name: data.fatherName || null,
      whatsapp: data.whatsapp,
      instagram: data.instagram || null,
      facebook: data.facebook || null,
      address: data.address,
      address_number: data.addressNumber,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      education: data.education,
      course: data.course || null,
      period: data.period || null,
      has_technical_course: data.hasTechnicalCourse,
      completed_courses: data.completedCourses || [],
      other_courses: data.otherCourses || null,
      has_criminal_record: data.hasCriminalRecord,
      work_experiences: data.workExperiences || [],
      salary_expectation: data.salaryExpectation,
      immediate_start: data.immediateStart,
      available_weekends: data.availableWeekends,
      available_holidays: data.availableHolidays,
      desired_position_1: data.desiredPosition1,
      desired_position_2: data.desiredPosition2 || null,
      desired_position_3: data.desiredPosition3 || null,
      lgpd_consent: data.lgpdConsent,
      lgpd_consent_date: data.lgpdConsent ? new Date().toISOString() : null,
    });

    if (error) {
      console.error("Erro ao salvar candidato:", error);
      toast.error("Erro ao salvar cadastro. Tente novamente.");
      throw error;
    }
  };

  return (
    <VacancyProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground py-6 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-center">
              Supermercados Marinho
            </h1>
            <p className="text-center text-primary-foreground/80 mt-1">
              Sistema de Recursos Humanos
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {!validatedCpf ? (
            <CpfPreCheck 
              onCpfValidated={handleCpfValidated} 
            />
          ) : (
            <CandidateForm 
              cpf={validatedCpf} 
              onSubmit={handleFormSubmit}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-muted py-4 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Supermercados Marinho - Todos os direitos reservados</p>
            <p className="mt-1">Sistema de RH - Cadastro de Candidatos</p>
          </div>
        </footer>
      </div>
    </VacancyProvider>
  );
};

export default Index;
