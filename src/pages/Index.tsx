import { useState } from "react";
import { CpfPreCheck } from "@/components/candidate/CpfPreCheck";
import { CandidateForm } from "@/components/candidate/CandidateForm";
import { VacancyProvider } from "@/contexts/VacancyContext";
import { CandidateForm } from "@/components/candidate/CandidateForm";

// Simulated existing CPFs (in production, this would come from a database)
const existingCpfs: string[] = [];

const Index = () => {
  const [validatedCpf, setValidatedCpf] = useState<string | null>(null);

  const handleCpfValidated = (cpf: string) => {
    setValidatedCpf(cpf);
  };

  const handleFormSubmit = (data: any) => {
    // In production, this would save to a database
    console.log("Form submitted:", data);
    existingCpfs.push(data.cpf);
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
              existingCpfs={existingCpfs}
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
