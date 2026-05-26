import { useState } from "react";
import { CpfPreCheck } from "@/components/candidate/CpfPreCheck";
import { CandidateForm } from "@/components/candidate/CandidateForm";
import type { CandidateFormData } from "@/components/candidate/CandidateForm";
import { VacancyProvider } from "@/contexts/VacancyContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

type CandidateInsert = Database["public"]["Tables"]["candidates"]["Insert"];

const Index = () => {
  const [validatedCpf, setValidatedCpf] = useState<string | null>(null);

  const handleCpfValidated = (cpf: string) => {
    setValidatedCpf(cpf);
  };

  const handleFormSubmit = async (data: CandidateFormData) => {
    let selfieUrl: string | null = null;
    let resumeUrl: string | null = null;
    const otherFilesUrls: string[] = [];

    const cpfDigits = data.cpf.replace(/\D/g, '');

    const { data: existingCandidate, error: lookupError } = await supabase
      .from("candidates")
      .select("id, selfie_url, resume_url, other_files_urls")
      .eq("cpf", cpfDigits)
      .maybeSingle();

    if (lookupError) {
      console.error("Erro ao verificar cadastro existente:", lookupError);
      toast.error("Erro ao verificar cadastro. Tente novamente.");
      throw lookupError;
    }

    // Upload selfie to storage
    if (data.selfieFile) {
      const path = `${cpfDigits}_${Date.now()}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from("selfies")
        .upload(path, data.selfieFile, { contentType: "image/jpeg" });
      if (uploadErr) {
        console.error("Erro ao enviar selfie:", uploadErr);
        toast.error("Erro ao enviar selfie. Tente novamente.");
        throw uploadErr;
      }
      const { data: urlData } = supabase.storage.from("selfies").getPublicUrl(path);
      selfieUrl = urlData.publicUrl;
    }

    // Upload resume
    if (data.resumeFile) {
      const safeName = data.resumeFile.name.replace(/[^\w.-]/g, '_');
      const path = `${cpfDigits}/${Date.now()}_${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("documents")
        .upload(path, data.resumeFile, { contentType: data.resumeFile.type || undefined });
      if (upErr) {
        console.error("Erro ao enviar currículo:", upErr);
        toast.error("Erro ao enviar currículo.");
      } else {
        resumeUrl = supabase.storage.from("documents").getPublicUrl(path).data.publicUrl;
      }
    }

    // Upload other files
    if (Array.isArray(data.otherFiles)) {
      for (const file of data.otherFiles) {
        const safeName = file.name.replace(/[^\w.-]/g, '_');
        const path = `${cpfDigits}/${Date.now()}_${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("documents")
          .upload(path, file, { contentType: file.type || undefined });
        if (!upErr) {
          otherFilesUrls.push(supabase.storage.from("documents").getPublicUrl(path).data.publicUrl);
        }
      }
    }

    const candidatePayload: CandidateInsert = {
      cpf: data.cpf,
      full_name: data.fullName,
      nickname: data.nickname || null,
      gender: data.gender || null,
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
      first_job: data.firstJob,
      work_experiences: (data.workExperiences || []) as unknown as Json,
      salary_expectation: data.salaryExpectation,
      immediate_start: data.immediateStart,
      available_weekends: data.availableWeekends,
      available_holidays: data.availableHolidays,
      desired_position_1: data.desiredPosition1,
      desired_position_2: data.desiredPosition2 || null,
      desired_position_3: data.desiredPosition3 || null,
      lgpd_consent: data.lgpdConsent,
      lgpd_consent_date: data.lgpdConsent ? new Date().toISOString() : null,
      selfie_url: selfieUrl || existingCandidate?.selfie_url || null,
      resume_url: resumeUrl || existingCandidate?.resume_url || null,
      other_files_urls: otherFilesUrls.length ? otherFilesUrls : existingCandidate?.other_files_urls || null,
    };

    const { error } = existingCandidate
      ? await supabase.from("candidates").update(candidatePayload).eq("id", existingCandidate.id)
      : await supabase.from("candidates").insert(candidatePayload);

    if (error) {
      console.error("Erro ao salvar candidato:", error);
      toast.error("Erro ao salvar cadastro. Tente novamente.");
      throw error;
    }
  };

  return (
    <VacancyProvider>
      <div className="min-h-screen bg-background bg-gradient-mesh">
        {/* Header */}
        <header className="app-header text-primary-foreground py-7 shadow-elevated">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-center tracking-tight">
              Supermercados Marinho
            </h1>
            <p className="text-center text-primary-foreground/85 mt-1 text-sm sm:text-base">
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
        <footer className="border-t border-border/60 bg-background/60 backdrop-blur-sm py-4 mt-auto">
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
