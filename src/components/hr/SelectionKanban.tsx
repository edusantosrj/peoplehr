import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignedAvatarImage } from "@/components/hr/SignedAvatarImage";
import { useVacancies } from "@/contexts/VacancyContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { saveEvaluation } from "@/services/hrDataService";
import type { Candidate } from "@/types/candidate";
import {
  CandidateHRData,
  CURRENT_STAGE_OPTIONS,
  CURRENT_STAGE_LABELS,
  CurrentStage,
} from "@/types/hr";

interface Props {
  candidates: Candidate[];
  hrDataMap: Record<string, CandidateHRData>;
  onSelectCandidate: (candidate: Candidate) => void;
  onUpdateHRData?: (data: CandidateHRData) => void;
}

const getStageStatus = (
  stage: CurrentStage,
  hr?: CandidateHRData
): string => {
  if (!hr) return "—";
  const ev = hr.evaluation;
  switch (stage) {
    case "validation_form":
      return ev.fichaValidation || "—";
    case "validation_manager":
      return ev.managementValidation || "—";
    case "validation_director":
      return ev.directorValidation || "—";
    case "proposal_presented":
      return ev.proposalPresented || "—";
    case "proposal_accepted":
      return ev.proposalAccepted || "—";
    case "documentation":
      return ev.documentationDelivered || "—";
    case "hired":
      return ev.candidateHired || "—";
  }
};

export const SelectionKanban = ({
  candidates,
  hrDataMap,
  onSelectCandidate,
  onUpdateHRData,
}: Props) => {
  const { vacancies } = useVacancies();
  const isMobile = useIsMobile();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<CurrentStage | null>(null);

  const grouped: Record<CurrentStage, Candidate[]> = {
    validation_form: [],
    validation_manager: [],
    validation_director: [],
    proposal_presented: [],
    proposal_accepted: [],
    documentation: [],
    hired: [],
  };

  candidates.forEach((c) => {
    const stage =
      (hrDataMap[c.id]?.evaluation?.currentStage as CurrentStage) ||
      "validation_form";
    grouped[stage].push(c);
  });

  const handleDrop = async (targetStage: CurrentStage) => {
    const candidateId = draggingId;
    setDraggingId(null);
    setDragOverStage(null);
    if (!candidateId) return;

    const hr = hrDataMap[candidateId];
    const currentStage = (hr?.evaluation?.currentStage as CurrentStage) || "validation_form";
    if (currentStage === targetStage) return;

    const prevEvaluation = hr?.evaluation;
    const newEvaluation = { ...prevEvaluation, currentStage: targetStage };
    const optimistic: CandidateHRData = {
      ...(hr as CandidateHRData),
      evaluation: newEvaluation,
    };
    onUpdateHRData?.(optimistic);

    const ok = await saveEvaluation(candidateId, newEvaluation);
    if (!ok) {
      // rollback
      onUpdateHRData?.({
        ...(hr as CandidateHRData),
        evaluation: prevEvaluation!,
      });
      toast.error("Não foi possível mover o candidato. Tente novamente.");
      return;
    }
    toast.success(`Candidato movido para ${CURRENT_STAGE_LABELS[targetStage]}.`);
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-7">
        {CURRENT_STAGE_OPTIONS.map((stage) => {
          const list = grouped[stage];
          const isOver = dragOverStage === stage;
          return (
            <div
              key={stage}
              onDragOver={(e) => {
                if (isMobile) return;
                e.preventDefault();
                if (dragOverStage !== stage) setDragOverStage(stage);
              }}
              onDragLeave={() => {
                if (dragOverStage === stage) setDragOverStage(null);
              }}
              onDrop={(e) => {
                if (isMobile) return;
                e.preventDefault();
                handleDrop(stage);
              }}
              className={`w-72 lg:w-auto flex-shrink-0 rounded-lg border flex flex-col transition-colors ${
                isOver
                  ? "bg-primary/10 border-primary"
                  : "bg-muted/40 border-border/60"
              }`}
            >
              <div className="px-3 py-3 border-b border-border/60 bg-background/60 rounded-t-lg">
                <div className="text-sm font-semibold text-foreground leading-tight">
                  {CURRENT_STAGE_LABELS[stage]}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  ({list.length})
                </div>
              </div>

              <div className="p-2 space-y-2 flex-1 min-h-[80px]">
                {list.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-6">
                    Nenhum candidato
                  </div>
                ) : (
                  list.map((cand) => {
                    const hr = hrDataMap[cand.id];
                    const admission = hr?.admission;
                    const vacancy = admission?.vacancyId
                      ? vacancies.find((v) => v.id === admission.vacancyId)
                      : undefined;
                    const unit = vacancy?.unit || admission?.storeUnit;
                    const shift = vacancy?.shift;
                    const initials = (cand.fullName || "?")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    const ev = hr?.evaluation;
                    const hasInterview = !!ev?.interviewDate;
                    const isDragging = draggingId === cand.id;

                    return (
                      <Card
                        key={cand.id}
                        draggable={!isMobile}
                        onDragStart={() => {
                          if (isMobile) return;
                          setDraggingId(cand.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDragOverStage(null);
                        }}
                        onClick={() => onSelectCandidate(cand)}
                        className={`p-3 cursor-pointer hover:shadow-md transition-all bg-card ${
                          isDragging ? "opacity-50" : ""
                        } ${!isMobile ? "cursor-grab active:cursor-grabbing" : ""}`}
                      >
                        <div className="flex items-start gap-2">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            {cand.selfieUrl && (
                              <SignedAvatarImage
                                bucket="selfies"
                                value={cand.selfieUrl}
                                alt={cand.fullName}
                              />
                            )}
                            <AvatarFallback className="text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">
                              {cand.fullName}
                            </div>
                            {cand.desiredPosition1 && (
                              <div className="text-xs text-muted-foreground truncate">
                                {cand.desiredPosition1}
                              </div>
                            )}
                            {unit && (
                              <div className="text-xs text-muted-foreground truncate">
                                {unit}
                              </div>
                            )}
                            {shift && (
                              <div className="text-xs text-muted-foreground truncate">
                                {shift}
                              </div>
                            )}
                          </div>
                        </div>

                        {(ev?.pcd || ev?.talentBank || ev?.ns || hasInterview) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {ev?.pcd && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                PCD
                              </Badge>
                            )}
                            {ev?.talentBank && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                Banco de Talentos
                              </Badge>
                            )}
                            {ev?.ns && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                N/S
                              </Badge>
                            )}
                            {hasInterview && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                Entrevista Agendada
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            {CURRENT_STAGE_LABELS[stage]}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {getStageStatus(stage, hr)}
                          </Badge>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
