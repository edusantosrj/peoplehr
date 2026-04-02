import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileSearch, Calendar, XCircle, CheckCircle, UserCheck, UserX } from "lucide-react";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";

interface FunnelReportProps {
  candidates: Candidate[];
  hrDataMap: Record<string, CandidateHRData>;
}

interface FunnelStep {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

export const FunnelReport = ({ candidates, hrDataMap }: FunnelReportProps) => {
  // Calculate funnel metrics based on evaluation status
  const calculateFunnelData = (): FunnelStep[] => {
    let total = candidates.length;
    let emAnalise = 0;
    let entrevistaAgendada = 0;
    let naoCompareceu = 0;
    let compareceu = 0;
    let contratados = 0;
    let naoContratados = 0;

    candidates.forEach((candidate) => {
      const hrData = hrDataMap[candidate.id];
      if (!hrData) {
        emAnalise++;
        return;
      }

      const { evaluation, admission } = hrData;

      // Count interview scheduled from actual field
      if (evaluation.interviewStatus && evaluation.interviewStatus !== 'Não') {
        entrevistaAgendada++;
      }

      // Count attended from actual field
      if (evaluation.interviewStatus === 'Compareceu') {
        compareceu++;
      }
      
      // Check if hired
      if (admission?.admissionStatus === "Contratado") {
        contratados++;
        return;
      }

      // Check evaluation status to determine funnel position
      if (evaluation.fichaValidation === "Não" || 
          evaluation.managementValidation === "Não" || 
          evaluation.directorValidation === "Não" ||
          evaluation.proposalPresented === "Não" || 
          evaluation.proposalAccepted === "Não") {
        naoContratados++;
        return;
      }

      // Default: em análise
      emAnalise++;
    });

    return [
      {
        label: "Total de Candidatos",
        count: total,
        icon: <Users className="h-6 w-6" />,
        color: "bg-primary/10 text-primary",
      },
      {
        label: "Em Análise",
        count: emAnalise,
        icon: <FileSearch className="h-6 w-6" />,
        color: "bg-yellow-100 text-yellow-700",
      },
      {
        label: "Entrevista Agendada",
        count: entrevistaAgendada,
        icon: <Calendar className="h-6 w-6" />,
        color: "bg-blue-100 text-blue-700",
      },
      {
        label: "Compareceu",
        count: compareceu,
        icon: <CheckCircle className="h-6 w-6" />,
        color: "bg-green-100 text-green-700",
      },
      {
        label: "Contratados",
        count: contratados,
        icon: <UserCheck className="h-6 w-6" />,
        color: "bg-emerald-100 text-emerald-700",
      },
      {
        label: "Não Contratados",
        count: naoContratados,
        icon: <UserX className="h-6 w-6" />,
        color: "bg-red-100 text-red-700",
      },
    ];
  };

  const funnelData = calculateFunnelData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Funil do Processo Seletivo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {funnelData.map((step, index) => (
            <div
              key={step.label}
              className={cn(
                "p-4 rounded-lg text-center transition-all hover:scale-105",
                step.color
              )}
            >
              <div className="flex justify-center mb-2">{step.icon}</div>
              <div className="text-3xl font-bold mb-1">{step.count}</div>
              <div className="text-xs font-medium">{step.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
