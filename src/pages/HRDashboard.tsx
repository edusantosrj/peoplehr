import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CandidateList } from "@/components/hr/CandidateList";
import { CandidateProfile } from "@/components/hr/CandidateProfile";
import { VacancyModule } from "@/components/vacancy/VacancyModule";
import { StaffDashboard } from "@/components/hr/StaffDashboard";
import { ReportsModule } from "@/components/hr/reports/ReportsModule";
import { VacancyProvider, useVacancies } from "@/contexts/VacancyContext";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";
import { createDefaultDocumentation } from "@/types/hr";
import { Users, Briefcase, UserCheck, BarChart3, FileText, AlertTriangle, Loader2, LogOut } from "lucide-react";
import { DocumentsControlPanel } from "@/components/hr/reports/DocumentsControlPanel";
import { ManagementAlerts } from "@/components/hr/alerts/ManagementAlerts";
import { LoginForm } from "@/components/hr/LoginForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const mergeHRData = (defaults: CandidateHRData, stored: any): CandidateHRData => ({
  ...defaults,
  ...stored,
  candidateId: defaults.candidateId,
  annotations: stored.annotations || defaults.annotations,
  evaluation: { ...defaults.evaluation, ...(stored.evaluation || {}) },
  admission: { ...defaults.admission, ...(stored.admission || {}) },
  termination: { ...defaults.termination, ...(stored.termination || {}) },
  documentation: {
    basicDocumentation: { ...defaults.documentation.basicDocumentation, ...(stored.documentation?.basicDocumentation || {}) },
    experienceContract: { ...defaults.documentation.experienceContract, ...(stored.documentation?.experienceContract || {}) },
    experienceExtension: { ...defaults.documentation.experienceExtension, ...(stored.documentation?.experienceExtension || {}) },
    priorNotice: { ...defaults.documentation.priorNotice, ...(stored.documentation?.priorNotice || {}) },
    terminationContract: { ...defaults.documentation.terminationContract, ...(stored.documentation?.terminationContract || {}) },
  },
  emergencyContacts: stored.emergencyContacts || defaults.emergencyContacts,
});

const mapDbRowToCandidate = (row: any): Candidate => ({
  id: row.id,
  cpf: row.cpf,
  fullName: row.full_name,
  registrationDate: row.created_at,
  birthDate: row.birth_date,
  maritalStatus: row.marital_status,
  motherName: row.mother_name,
  fatherName: row.father_name || undefined,
  whatsapp: row.whatsapp,
  instagram: row.instagram || undefined,
  facebook: row.facebook || undefined,
  address: row.address,
  addressNumber: row.address_number,
  neighborhood: row.neighborhood,
  city: row.city,
  state: row.state,
  education: row.education,
  course: row.course || undefined,
  period: row.period || undefined,
  hasTechnicalCourse: row.has_technical_course,
  completedCourses: row.completed_courses || [],
  otherCourses: row.other_courses || undefined,
  hasCriminalRecord: row.has_criminal_record,
  workExperiences: Array.isArray(row.work_experiences) ? row.work_experiences : [],
  salaryExpectation: row.salary_expectation,
  immediateStart: row.immediate_start,
  availableWeekends: row.available_weekends,
  availableHolidays: row.available_holidays,
  desiredPosition1: row.desired_position_1,
  desiredPosition2: row.desired_position_2 || undefined,
  desiredPosition3: row.desired_position_3 || undefined,
  resumeUrl: row.resume_url || undefined,
  lgpdConsent: row.lgpd_consent,
  lgpdConsentDate: row.lgpd_consent_date || undefined,
});

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
    interviewStatus: 'Não',
  },
  admission: {},
  termination: {},
  documentation: createDefaultDocumentation(),
  emergencyContacts: [],
});

const HRDashboardContent = () => {
  const { vacancies } = useVacancies();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hrDataMap, setHRDataMap] = useState<Record<string, CandidateHRData>>({});
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [activeTab, setActiveTab] = useState("alertas");
  const [loading, setLoading] = useState(true);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar candidatos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os candidatos.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const mappedCandidates = (data || []).map(mapDbRowToCandidate);
    setCandidates(mappedCandidates);

    const hrMap: Record<string, CandidateHRData> = {};
    (data || []).forEach((row: any) => {
      if (row.hr_data) {
        hrMap[row.id] = { ...createInitialHRData(row.id), ...row.hr_data, candidateId: row.id };
      } else {
        hrMap[row.id] = createInitialHRData(row.id);
      }
    });
    setHRDataMap(hrMap);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleSelectCandidateById = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate) {
      setSelectedCandidate(candidate);
    }
  };

  const handleBack = () => {
    setSelectedCandidate(null);
  };

  const handleNavigateToPanel = (panel: string) => {
    setActiveTab(panel);
  };

  const handleUpdateHRData = async (data: CandidateHRData) => {
    setHRDataMap((prev) => ({
      ...prev,
      [data.candidateId]: data,
    }));

    const { error } = await supabase
      .from("candidates")
      .update({ hr_data: data as any })
      .eq("id", data.candidateId);

    if (error) {
      console.error("Erro ao salvar dados do RH:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando candidatos...</span>
      </div>
    );
  }

  if (selectedCandidate) {
    return (
      <CandidateProfile
        candidate={selectedCandidate}
        hrData={hrDataMap[selectedCandidate.id]}
        onBack={handleBack}
        onUpdateHRData={handleUpdateHRData}
      />
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full max-w-4xl grid-cols-6 mb-6">
        <TabsTrigger value="alertas" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Alertas
        </TabsTrigger>
        <TabsTrigger value="candidatos" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Candidatos
        </TabsTrigger>
        <TabsTrigger value="vagas" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Vagas
        </TabsTrigger>
        <TabsTrigger value="efetivo" className="flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Efetivo
        </TabsTrigger>
        <TabsTrigger value="documentos" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documentos
        </TabsTrigger>
        <TabsTrigger value="relatorios" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Relatórios
        </TabsTrigger>
      </TabsList>

      <TabsContent value="alertas">
        <ManagementAlerts
          candidates={candidates}
          hrDataMap={hrDataMap}
          vacancies={vacancies}
          onNavigateToCandidate={handleSelectCandidateById}
          onNavigateToPanel={handleNavigateToPanel}
        />
      </TabsContent>

      <TabsContent value="candidatos">
        <CandidateList
          candidates={candidates}
          onSelectCandidate={handleSelectCandidate}
          hrDataMap={hrDataMap}
        />
      </TabsContent>

      <TabsContent value="vagas">
        <VacancyModule />
      </TabsContent>

      <TabsContent value="efetivo">
        <StaffDashboard
          candidates={candidates}
          hrDataMap={hrDataMap}
        />
      </TabsContent>

      <TabsContent value="documentos">
        <DocumentsControlPanel
          candidates={candidates}
          hrDataMap={hrDataMap}
        />
      </TabsContent>

      <TabsContent value="relatorios">
        <ReportsModule
          candidates={candidates}
          hrDataMap={hrDataMap}
        />
      </TabsContent>
    </Tabs>
  );
};

const HRDashboard = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setAuthLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <VacancyProvider>
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground py-6 shadow-md">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Supermercados Marinho
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                Sistema de Recursos Humanos - Painel RH
              </p>
            </div>
            {session && (
              <Button variant="secondary" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {session ? <HRDashboardContent /> : <LoginForm onLogin={() => {}} />}
        </main>

        <footer className="bg-muted py-4 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Supermercados Marinho - Todos os direitos reservados</p>
            <p className="mt-1">Sistema de RH - Painel Administrativo</p>
          </div>
        </footer>
      </div>
    </VacancyProvider>
  );
};

export default HRDashboard;
