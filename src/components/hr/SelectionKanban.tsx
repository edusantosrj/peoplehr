import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignedAvatarImage } from "@/components/hr/SignedAvatarImage";
import { useVacancies } from "@/contexts/VacancyContext";
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
}: Props) => {
  const { vacancies } = useVacancies();

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

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-7">
        {CURRENT_STAGE_OPTIONS.map((stage) => {
          const list = grouped[stage];
          return (
            <div
              key={stage}
              className="w-72 lg:w-auto flex-shrink-0 bg-muted/40 rounded-lg border border-border/60 flex flex-col"
            >
              <div className="px-3 py-3 border-b border-border/60 bg-background/60 rounded-t-lg">
                <div className="text-sm font-semibold text-foreground leading-tight">
                  {CURRENT_STAGE_LABELS[stage]}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  ({list.length})
                </div>
              </div>

              <div className="p-2 space-y-2 flex-1">
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

                    return (
                      <Card
                        key={cand.id}
                        onClick={() => onSelectCandidate(cand)}
                        className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-card"
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
