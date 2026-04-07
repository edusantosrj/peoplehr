import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  UserPlus, 
  ClipboardCheck, 
  Briefcase, 
  FileText, 
  UserMinus,
  MessageSquare,
  Shield,
  Calendar,
  DollarSign,
  Building,
  Clock
} from "lucide-react";
import type { Candidate } from "@/types/candidate";
import { formatDateDisplay } from "@/utils/textFormatting";
import type { CandidateHRData } from "@/types/hr";

interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type: 'cadastro' | 'processo' | 'vaga' | 'admissao' | 'documentacao' | 'movimentacao' | 'desligamento' | 'anotacao';
  title: string;
  description: string;
  origin: 'Sistema' | 'RH' | 'Gerência' | 'Diretoria';
  icon: React.ReactNode;
}

interface HistoryBlockProps {
  candidate: Candidate;
  hrData: CandidateHRData;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { date: formatDateDisplay(dateString), time: '00:00' };
  }
  return {
    date: date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
};

const getEventTypeColor = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'cadastro':
      return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'processo':
      return 'bg-purple-500/10 text-purple-600 border-purple-200';
    case 'vaga':
      return 'bg-orange-500/10 text-orange-600 border-orange-200';
    case 'admissao':
      return 'bg-green-500/10 text-green-600 border-green-200';
    case 'documentacao':
      return 'bg-cyan-500/10 text-cyan-600 border-cyan-200';
    case 'movimentacao':
      return 'bg-amber-500/10 text-amber-600 border-amber-200';
    case 'desligamento':
      return 'bg-red-500/10 text-red-600 border-red-200';
    case 'anotacao':
      return 'bg-gray-500/10 text-gray-600 border-gray-200';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getEventTypeLabel = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'cadastro': return 'Cadastro';
    case 'processo': return 'Processo Seletivo';
    case 'vaga': return 'Vaga';
    case 'admissao': return 'Admissão';
    case 'documentacao': return 'Documentação';
    case 'movimentacao': return 'Movimentação';
    case 'desligamento': return 'Desligamento';
    case 'anotacao': return 'Anotação';
    default: return 'Evento';
  }
};

const getOriginBadgeVariant = (origin: TimelineEvent['origin']) => {
  switch (origin) {
    case 'Sistema': return 'secondary';
    case 'RH': return 'default';
    case 'Gerência': return 'outline';
    case 'Diretoria': return 'destructive';
    default: return 'secondary';
  }
};

export const HistoryBlock = ({ candidate, hrData }: HistoryBlockProps) => {
  // Generate timeline events from existing data
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // 1. Registration events
    if (candidate.registrationDate) {
      const { date, time } = formatDateTime(candidate.registrationDate);
      events.push({
        id: `reg-cpf-${candidate.id}`,
        date,
        time,
        type: 'cadastro',
        title: 'CPF Validado',
        description: `CPF verificado e validado pelo sistema`,
        origin: 'Sistema',
        icon: <Shield className="h-4 w-4" />,
      });
      events.push({
        id: `reg-complete-${candidate.id}`,
        date,
        time,
        type: 'cadastro',
        title: 'Cadastro Inicial Concluído',
        description: `Candidato ${candidate.fullName} realizou cadastro completo no sistema`,
        origin: 'Sistema',
        icon: <UserPlus className="h-4 w-4" />,
      });
    }

    // 2. LGPD consent
    if (candidate.lgpdConsentDate) {
      const { date, time } = formatDateTime(candidate.lgpdConsentDate);
      events.push({
        id: `lgpd-${candidate.id}`,
        date,
        time,
        type: 'cadastro',
        title: 'Termo LGPD Aceito',
        description: 'Candidato aceitou os termos de consentimento LGPD',
        origin: 'Sistema',
        icon: <FileText className="h-4 w-4" />,
      });
    }

    // 3. HR Annotations
    hrData.annotations.forEach((annotation) => {
      const { date, time } = formatDateTime(annotation.createdAt);
      events.push({
        id: `annotation-${annotation.id}`,
        date,
        time,
        type: 'anotacao',
        title: 'Anotação do RH Adicionada',
        description: annotation.text,
        origin: 'RH',
        icon: <MessageSquare className="h-4 w-4" />,
      });
    });

    // 4. Evaluation updates (based on current state - simulating events)
    const evaluationLabels: Record<string, string> = {
      fichaValidation: 'Validação da Ficha',
      managementValidation: 'Validação da Gerência',
      directorValidation: 'Validação da Diretoria',
      proposalPresented: 'Proposta Apresentada',
      proposalAccepted: 'Proposta Aceita',
      documentationDelivered: 'Documentação Entregue',
      candidateHired: 'Candidato Contratado',
    };

    Object.entries(hrData.evaluation).forEach(([key, value]) => {
      if (value === 'Sim' || value === 'Não') {
        const label = evaluationLabels[key] || key;
        const origin = key.includes('director') ? 'Diretoria' : key.includes('management') ? 'Gerência' : 'RH';
        events.push({
          id: `eval-${key}-${candidate.id}`,
          date: new Date().toLocaleDateString('pt-BR'),
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          type: 'processo',
          title: `${label}: ${value}`,
          description: `Status de "${label}" alterado para "${value}" por ${origin}`,
          origin: origin as TimelineEvent['origin'],
          icon: <ClipboardCheck className="h-4 w-4" />,
        });
      }
    });

    // 5. Vacancy linked
    if (hrData.admission.vacancyDisplay) {
      events.push({
        id: `vacancy-linked-${candidate.id}`,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'vaga',
        title: 'Vaga Vinculada',
        description: `Candidato vinculado à vaga: ${hrData.admission.vacancyDisplay}`,
        origin: 'RH',
        icon: <Briefcase className="h-4 w-4" />,
      });
    }

    // 6. Admission events
    if (hrData.admission.admissionStatus === 'Contratado') {
      events.push({
        id: `admission-status-${candidate.id}`,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'admissao',
        title: 'Status Alterado para Contratado',
        description: 'Candidato passou para status "Contratado" no processo de admissão',
        origin: 'RH',
        icon: <UserPlus className="h-4 w-4" />,
      });
    }

    if (hrData.admission.definedSalary) {
      events.push({
        id: `admission-salary-${candidate.id}`,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'admissao',
        title: 'Salário Definido',
        description: `Salário definido: ${hrData.admission.definedSalary}`,
        origin: 'RH',
        icon: <DollarSign className="h-4 w-4" />,
      });
    }

    if (hrData.admission.storeUnit) {
      events.push({
        id: `admission-unit-${candidate.id}`,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'admissao',
        title: 'Unidade Definida',
        description: `Unidade de trabalho definida: ${hrData.admission.storeUnit}`,
        origin: 'RH',
        icon: <Building className="h-4 w-4" />,
      });
    }

    if (hrData.admission.expectedStartDate) {
      events.push({
        id: `admission-start-${candidate.id}`,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'admissao',
        title: 'Data de Início Prevista',
        description: `Data prevista de início: ${formatDateDisplay(hrData.admission.expectedStartDate)}`,
        origin: 'RH',
        icon: <Calendar className="h-4 w-4" />,
      });
    }

    // 7. Documentation events
    const docLabels: Record<string, string> = {
      basicDocumentation: 'Documentação básica para contratação',
      experienceContract: 'Contrato de experiência',
      experienceExtension: 'Contrato de prorrogação do período de experiência',
      priorNotice: 'Aviso prévio',
      terminationContract: 'Contrato de rescisão de trabalho',
    };

    Object.entries(hrData.documentation).forEach(([key, doc]) => {
      if (doc.checked) {
        const label = docLabels[key] || key;
        events.push({
          id: `doc-${key}-${candidate.id}`,
          date: new Date().toLocaleDateString('pt-BR'),
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          type: 'documentacao',
          title: 'Documento Entregue',
          description: `Documento "${label}" marcado como entregue`,
          origin: 'RH',
          icon: <FileText className="h-4 w-4" />,
        });
      }
    });

    // 8. Termination events
    if (hrData.termination.requestDate) {
      const { date, time } = formatDateTime(hrData.termination.requestDate);
      events.push({
        id: `term-request-${candidate.id}`,
        date,
        time,
        type: 'desligamento',
        title: 'Pedido de Desligamento Registrado',
        description: `Solicitação de desligamento registrada${hrData.termination.voluntaryTermination ? ' (voluntário)' : ' (involuntário)'}`,
        origin: 'RH',
        icon: <UserMinus className="h-4 w-4" />,
      });
    }

    if (hrData.termination.terminationReason) {
      events.push({
        id: `term-reason-${candidate.id}`,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'desligamento',
        title: 'Motivo de Desligamento Registrado',
        description: `Motivo: ${hrData.termination.terminationReason}`,
        origin: 'RH',
        icon: <UserMinus className="h-4 w-4" />,
      });
    }

    if (hrData.termination.confirmed) {
      events.push({
        id: `term-confirmed-${candidate.id}`,
        date: hrData.termination.lastWorkDay 
          ? new Date(hrData.termination.lastWorkDay).toLocaleDateString('pt-BR')
          : new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'desligamento',
        title: 'Desligamento Confirmado',
        description: `Desligamento confirmado. ${hrData.termination.canBeRehired ? 'Elegível para recontratação.' : 'Não elegível para recontratação.'}`,
        origin: 'RH',
        icon: <UserMinus className="h-4 w-4" />,
      });
    }

    // Sort by date (most recent first) - we'll use a simple sort since dates are formatted
    return events.sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('') + a.time.replace(':', '');
      const dateB = b.date.split('/').reverse().join('') + b.time.replace(':', '');
      return dateB.localeCompare(dateA);
    });
  };

  const timelineEvents = generateTimelineEvents();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Histórico de Movimentações
          <Badge variant="secondary" className="ml-auto">
            {timelineEvents.length} eventos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timelineEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma movimentação registrada ainda.
          </p>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-2 top-2 h-5 w-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${getEventTypeColor(event.type)}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {event.icon}
                          <span className="font-medium text-sm">{event.title}</span>
                        </div>
                        <Badge variant={getOriginBadgeVariant(event.origin)} className="text-xs shrink-0">
                          {event.origin}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getEventTypeLabel(event.type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
