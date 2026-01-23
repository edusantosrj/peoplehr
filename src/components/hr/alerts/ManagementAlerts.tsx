import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  FileWarning,
  UserX,
  Briefcase,
  Clock,
  FileX,
  Users,
  TrendingDown,
  Building2,
  ExternalLink,
} from "lucide-react";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";
import type { Vacancy } from "@/types/vacancy";
import { getDocumentStatus } from "@/components/hr/blocks/DocumentationBlock";
import { DOCUMENT_LABELS, type CandidateDocumentation } from "@/types/hr";

interface ManagementAlertsProps {
  candidates: Candidate[];
  hrDataMap: Record<string, CandidateHRData>;
  vacancies: Vacancy[];
  onNavigateToCandidate?: (candidateId: string) => void;
  onNavigateToPanel?: (panel: string) => void;
}

type AlertPriority = 'critical' | 'high' | 'medium';
type AlertCategory = 'documentation' | 'admission' | 'vacancy' | 'process' | 'termination';

interface Alert {
  id: string;
  type: AlertCategory;
  priority: AlertPriority;
  title: string;
  description: string;
  candidateId?: string;
  panelLink?: string;
  forDirectors: boolean;
}

// Utility to mask CPF
const maskCpf = (cpf: string): string => {
  if (!cpf || cpf.length < 11) return "***.***.***-**";
  return `${cpf.slice(0, 3)}.***.**-${cpf.slice(-2)}`;
};

// Get days since a date
const getDaysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const ManagementAlerts = ({
  candidates,
  hrDataMap,
  vacancies,
  onNavigateToCandidate,
  onNavigateToPanel,
}: ManagementAlertsProps) => {
  // Generate all alerts
  const allAlerts = useMemo((): Alert[] => {
    const alerts: Alert[] = [];

    // Get hired candidates for various checks
    const hiredCandidates = candidates.filter((c) => {
      const hrData = hrDataMap[c.id];
      return hrData?.admission?.admissionStatus === "Contratado" && !hrData?.termination?.confirmed;
    });

    // === DOCUMENTATION ALERTS ===
    const documentKeys = Object.keys(DOCUMENT_LABELS) as (keyof CandidateDocumentation)[];
    let expiredDocsCount = 0;
    let expiringDocsCount = 0;

    hiredCandidates.forEach((candidate) => {
      const hrData = hrDataMap[candidate.id];
      if (!hrData?.documentation) return;

      documentKeys.forEach((key) => {
        if (key === "basicDocumentation") return;
        const doc = hrData.documentation[key];
        if (!doc.expirationDate) return;

        const status = getDocumentStatus(doc.expirationDate);
        if (status === "expired") {
          expiredDocsCount++;
          alerts.push({
            id: `doc-expired-${candidate.id}-${key}`,
            type: "documentation",
            priority: "critical",
            title: "Documento Vencido",
            description: `${candidate.fullName}: ${DOCUMENT_LABELS[key]} vencido`,
            candidateId: candidate.id,
            forDirectors: false,
          });
        } else if (status === "expiring") {
          expiringDocsCount++;
          alerts.push({
            id: `doc-expiring-${candidate.id}-${key}`,
            type: "documentation",
            priority: "high",
            title: "Documento Vence em Breve",
            description: `${candidate.fullName}: ${DOCUMENT_LABELS[key]} vence em até 15 dias`,
            candidateId: candidate.id,
            forDirectors: false,
          });
        }
      });
    });

    // Director alert for high volume of expired docs
    if (expiredDocsCount >= 3) {
      alerts.push({
        id: "director-expired-docs",
        type: "documentation",
        priority: "critical",
        title: "Volume Elevado de Documentos Vencidos",
        description: `${expiredDocsCount} documentos vencidos requerem atenção imediata`,
        panelLink: "documentos",
        forDirectors: true,
      });
    }

    // === ADMISSION ALERTS ===
    candidates.forEach((candidate) => {
      const hrData = hrDataMap[candidate.id];
      if (!hrData) return;
      const { admission } = hrData;

      if (admission?.admissionStatus === "Contratado") {
        // Missing start date
        if (!admission.expectedStartDate) {
          alerts.push({
            id: `adm-no-date-${candidate.id}`,
            type: "admission",
            priority: "high",
            title: "Data de Início Ausente",
            description: `${candidate.fullName}: contratado sem data prevista de início`,
            candidateId: candidate.id,
            forDirectors: false,
          });
        }

        // Missing vacancy
        if (!admission.vacancyId) {
          alerts.push({
            id: `adm-no-vacancy-${candidate.id}`,
            type: "admission",
            priority: "high",
            title: "Vaga Não Selecionada",
            description: `${candidate.fullName}: contratado sem vaga vinculada`,
            candidateId: candidate.id,
            forDirectors: false,
          });
        }

        // Zero salary
        if (admission.definedSalary === "R$ 0,00" || admission.definedSalary === "R$0,00") {
          alerts.push({
            id: `adm-zero-salary-${candidate.id}`,
            type: "admission",
            priority: "medium",
            title: "Salário Zero",
            description: `${candidate.fullName}: admissão salva com salário R$ 0,00`,
            candidateId: candidate.id,
            forDirectors: false,
          });
        }
      }
    });

    // === VACANCY ALERTS ===
    const activeVacancies = vacancies.filter((v) => v.status === "Ativa");
    let criticalVacanciesCount = 0;

    vacancies.forEach((vacancy) => {
      // Zero quantity
      if (vacancy.quantity === 0 && vacancy.status === "Ativa") {
        alerts.push({
          id: `vac-zero-${vacancy.id}`,
          type: "vacancy",
          priority: "medium",
          title: "Vaga com Quantitativo Zerado",
          description: `${vacancy.name} (${vacancy.unit}): quantidade = 0`,
          panelLink: "vagas",
          forDirectors: false,
        });
      }

      // Active vacancy without linked candidates
      if (vacancy.status === "Ativa") {
        const linkedCandidates = candidates.filter((c) => {
          const hrData = hrDataMap[c.id];
          return hrData?.admission?.vacancyId === vacancy.id;
        });
        if (linkedCandidates.length === 0) {
          criticalVacanciesCount++;
          alerts.push({
            id: `vac-no-candidates-${vacancy.id}`,
            type: "vacancy",
            priority: "high",
            title: "Vaga Ativa sem Candidatos",
            description: `${vacancy.name} (${vacancy.unit}): nenhum candidato vinculado`,
            panelLink: "vagas",
            forDirectors: false,
          });
        }
      }

      // Inactive vacancy with candidate still in process
      if (vacancy.status === "Inativa") {
        const inProcessCandidates = candidates.filter((c) => {
          const hrData = hrDataMap[c.id];
          return (
            hrData?.admission?.vacancyId === vacancy.id &&
            hrData?.admission?.admissionStatus !== "Contratado" &&
            hrData?.admission?.admissionStatus !== "Cancelado"
          );
        });
        if (inProcessCandidates.length > 0) {
          alerts.push({
            id: `vac-closed-with-process-${vacancy.id}`,
            type: "vacancy",
            priority: "high",
            title: "Vaga Encerrada com Candidato em Processo",
            description: `${vacancy.name}: ${inProcessCandidates.length} candidato(s) ainda em processo`,
            panelLink: "vagas",
            forDirectors: false,
          });
        }
      }
    });

    // Director alert for unfilled vacancies
    if (criticalVacanciesCount >= 2) {
      alerts.push({
        id: "director-vacancies-critical",
        type: "vacancy",
        priority: "high",
        title: "Vagas Críticas sem Preenchimento",
        description: `${criticalVacanciesCount} vagas ativas sem candidatos vinculados`,
        panelLink: "vagas",
        forDirectors: true,
      });
    }

    // === PROCESS ALERTS ===
    candidates.forEach((candidate) => {
      const hrData = hrDataMap[candidate.id];
      if (!hrData) return;

      const { evaluation, admission } = hrData;

      // Skip if already hired or cancelled
      if (admission?.admissionStatus === "Contratado" || admission?.admissionStatus === "Cancelado") {
        return;
      }

      // Candidate stalled in "Em Análise" for over 15 days
      if (evaluation.fichaValidation === "Em Análise") {
        const daysSince = getDaysSince(candidate.registrationDate);
        if (daysSince > 15) {
          alerts.push({
            id: `proc-stalled-${candidate.id}`,
            type: "process",
            priority: "medium",
            title: "Candidato Parado em Análise",
            description: `${candidate.fullName}: há ${daysSince} dias em "Em Análise"`,
            candidateId: candidate.id,
            forDirectors: false,
          });
        }
      }

      // "Não Compareceu" status simulation (fichaValidation = "Não" as proxy)
      // In real scenario, would check interview attendance field
    });

    // === TERMINATION ALERTS ===
    candidates.forEach((candidate) => {
      const hrData = hrDataMap[candidate.id];
      if (!hrData) return;

      const { termination, documentation, admission } = hrData;

      // Only check if termination was initiated/confirmed
      if (termination?.confirmed) {
        // Missing reason
        if (!termination.terminationReason) {
          alerts.push({
            id: `term-no-reason-${candidate.id}`,
            type: "termination",
            priority: "high",
            title: "Desligamento sem Motivo",
            description: `${candidate.fullName}: desligamento confirmado sem motivo informado`,
            candidateId: candidate.id,
            forDirectors: false,
          });
        }

        // Missing notice decision
        if (termination.willServeNotice === undefined) {
          alerts.push({
            id: `term-no-notice-decision-${candidate.id}`,
            type: "termination",
            priority: "high",
            title: "Aviso Prévio Indefinido",
            description: `${candidate.fullName}: sem definição sobre aviso prévio`,
            candidateId: candidate.id,
            forDirectors: false,
          });
        }

        // Missing termination contract
        if (!documentation?.terminationContract?.checked) {
          alerts.push({
            id: `term-no-contract-${candidate.id}`,
            type: "termination",
            priority: "critical",
            title: "Contrato de Rescisão Ausente",
            description: `${candidate.fullName}: desligado sem contrato de rescisão marcado`,
            candidateId: candidate.id,
            forDirectors: false,
          });
        }
      }
    });

    // === DIRECTOR STRATEGIC ALERTS ===
    // Count terminations per unit for turnover analysis
    const terminationsByUnit = new Map<string, number>();
    candidates.forEach((c) => {
      const hrData = hrDataMap[c.id];
      if (hrData?.termination?.confirmed && hrData?.admission?.storeUnit) {
        const unit = hrData.admission.storeUnit;
        terminationsByUnit.set(unit, (terminationsByUnit.get(unit) || 0) + 1);
      }
    });

    // Alert for high turnover in a unit
    terminationsByUnit.forEach((count, unit) => {
      if (count >= 3) {
        alerts.push({
          id: `director-turnover-${unit}`,
          type: "termination",
          priority: "high",
          title: "Aumento de Desligamentos",
          description: `${unit}: ${count} desligamentos registrados`,
          panelLink: "relatorios",
          forDirectors: true,
        });
      }
    });

    // Check staffing levels per unit/sector
    const staffByUnit = new Map<string, number>();
    hiredCandidates.forEach((c) => {
      const hrData = hrDataMap[c.id];
      if (hrData?.admission?.storeUnit) {
        const unit = hrData.admission.storeUnit;
        staffByUnit.set(unit, (staffByUnit.get(unit) || 0) + 1);
      }
    });

    // Alert if unit has very few employees
    staffByUnit.forEach((count, unit) => {
      if (count <= 1) {
        alerts.push({
          id: `director-low-staff-${unit}`,
          type: "vacancy",
          priority: "high",
          title: "Quadro de Efetivo Reduzido",
          description: `${unit}: apenas ${count} funcionário(s) ativo(s)`,
          panelLink: "efetivo",
          forDirectors: true,
        });
      }
    });

    return alerts;
  }, [candidates, hrDataMap, vacancies]);

  // Separate HR and Director alerts
  const hrAlerts = allAlerts.filter((a) => !a.forDirectors);
  const directorAlerts = allAlerts.filter((a) => a.forDirectors);

  // Sort by priority
  const priorityOrder: Record<AlertPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
  };

  const sortedHrAlerts = [...hrAlerts].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
  const sortedDirectorAlerts = [...directorAlerts].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  const getAlertIcon = (type: AlertCategory) => {
    switch (type) {
      case "documentation":
        return FileWarning;
      case "admission":
        return Users;
      case "vacancy":
        return Briefcase;
      case "process":
        return Clock;
      case "termination":
        return UserX;
      default:
        return AlertTriangle;
    }
  };

  const getPriorityColor = (priority: AlertPriority) => {
    switch (priority) {
      case "critical":
        return "bg-destructive/10 border-destructive/30 text-destructive";
      case "high":
        return "bg-orange-500/10 border-orange-500/30 text-orange-600";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-600";
    }
  };

  const getPriorityBadge = (priority: AlertPriority) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Crítico</Badge>;
      case "high":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Alto</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">Médio</Badge>;
    }
  };

  const handleAlertClick = (alert: Alert) => {
    if (alert.candidateId && onNavigateToCandidate) {
      onNavigateToCandidate(alert.candidateId);
    } else if (alert.panelLink && onNavigateToPanel) {
      onNavigateToPanel(alert.panelLink);
    }
  };

  const totalAlerts = allAlerts.length;

  if (totalAlerts === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-100">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-muted-foreground">
            Nenhum alerta ativo. Todos os processos estão em ordem.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Alertas Gerenciais
          </h2>
          <p className="text-muted-foreground">
            Monitoramento de riscos e pendências operacionais
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {totalAlerts} alerta{totalAlerts !== 1 ? "s" : ""} ativo{totalAlerts !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* HR Alerts */}
      {sortedHrAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Alertas RH
              </CardTitle>
              <Badge variant="outline">{sortedHrAlerts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {sortedHrAlerts.map((alert, index) => {
                  const Icon = getAlertIcon(alert.type);
                  return (
                    <div key={alert.id}>
                      <div
                        className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${getPriorityColor(alert.priority)}`}
                        onClick={() => handleAlertClick(alert)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{alert.title}</span>
                              {getPriorityBadge(alert.priority)}
                            </div>
                            <p className="text-xs mt-1 opacity-80">{alert.description}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-50" />
                        </div>
                      </div>
                      {index < sortedHrAlerts.length - 1 && <Separator className="my-2" />}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Director Alerts */}
      {sortedDirectorAlerts.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3 bg-primary/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Alertas Diretoria
              </CardTitle>
              <Badge variant="outline">{sortedDirectorAlerts.length}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Indicadores consolidados para tomada de decisão estratégica
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {sortedDirectorAlerts.map((alert, index) => {
                const Icon = getAlertIcon(alert.type);
                return (
                  <div key={alert.id}>
                    <div
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${getPriorityColor(alert.priority)}`}
                      onClick={() => handleAlertClick(alert)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{alert.title}</span>
                            {getPriorityBadge(alert.priority)}
                          </div>
                          <p className="text-xs mt-1 opacity-80">{alert.description}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-50" />
                      </div>
                    </div>
                    {index < sortedDirectorAlerts.length - 1 && <Separator className="my-2" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
