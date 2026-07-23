import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignedAvatarImage } from "@/components/hr/SignedAvatarImage";
import { useVacancies } from "@/contexts/VacancyContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { saveEvaluation } from "@/services/hrDataService";
import { X } from "lucide-react";
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

const VALIDATION_STAGES: CurrentStage[] = [
  "validation_form",
  "validation_manager",
  "validation_director",
];

const getStatusSummary = (stage: CurrentStage, list: Candidate[], hrMap: Record<string, CandidateHRData>) => {
  const counts: Record<string, number> = {};
  list.forEach((c) => {
    const s = getStageStatus(stage, hrMap[c.id]);
    counts[s] = (counts[s] || 0) + 1;
  });
  const isValidation = VALIDATION_STAGES.includes(stage);
  const order = isValidation
    ? ["Iniciada", "Aprovada", "Aprovada com Restrição", "Reprovada", "Não Iniciada"]
    : ["Sim", "Não", "-", "—"];
  const labelMap: Record<string, string> = {
    "Aprovada com Restrição": "Restrição",
  };
  return order
    .filter((k) => counts[k])
    .map((k) => ({ label: labelMap[k] || k, count: counts[k] }));
};

const relativeDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const startD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const startN = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((startN.getTime() - startD.getTime()) / 86400000);
  if (days <= 0) return "Hoje";
  if (days === 1) return "Ontem";
  return `Há ${days} dias`;
};

const isDocumentationComplete = (hr?: CandidateHRData): boolean => {
  const doc = hr?.documentation;
  if (!doc) return false;
  const items = Object.values(doc);
  if (items.length === 0) return false;
  return items.every((it) => it?.checked || it?.completed);
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
  const [viewMode, setViewMode] = useState<"active" | "closed">("active");

  // Filters
  const [fName, setFName] = useState("");
  const [fUnit, setFUnit] = useState<string>("all");
  const [fPosition, setFPosition] = useState<string>("all");
  const [fTalent, setFTalent] = useState<string>("all");
  const [fPcd, setFPcd] = useState<string>("all");
  const [fHired, setFHired] = useState<string>("all");
  const [fNs, setFNs] = useState<string>("all");

  const getCandUnit = (c: Candidate): string | undefined => {
    const hr = hrDataMap[c.id];
    const vac = hr?.admission?.vacancyId
      ? vacancies.find((v) => v.id === hr.admission!.vacancyId)
      : undefined;
    return vac?.unit || hr?.admission?.storeUnit;
  };

  const { unitOptions, positionOptions } = useMemo(() => {
    const units = new Set<string>();
    const positions = new Set<string>();
    candidates.forEach((c) => {
      const u = getCandUnit(c);
      if (u) units.add(u);
      if (c.desiredPosition1) positions.add(c.desiredPosition1);
      if (c.desiredPosition2) positions.add(c.desiredPosition2);
    });
    return {
      unitOptions: Array.from(units).sort(),
      positionOptions: Array.from(positions).sort(),
    };
  }, [candidates, hrDataMap, vacancies]);

  const filteredCandidates = useMemo(() => {
    const term = fName.trim().toLowerCase();
    return candidates.filter((c) => {
      if (term && !(c.fullName || "").toLowerCase().includes(term)) return false;
      const hr = hrDataMap[c.id];
      const ev = hr?.evaluation;
      if (fUnit !== "all" && getCandUnit(c) !== fUnit) return false;
      if (
        fPosition !== "all" &&
        c.desiredPosition1 !== fPosition &&
        c.desiredPosition2 !== fPosition
      )
        return false;
      if (fTalent !== "all" && !!ev?.talentBank !== (fTalent === "yes")) return false;
      if (fPcd !== "all" && !!ev?.pcd !== (fPcd === "yes")) return false;
      if (fNs !== "all" && !!ev?.ns !== (fNs === "yes")) return false;
      if (fHired !== "all") {
        const hired = ev?.candidateHired === "Sim";
        if (hired !== (fHired === "yes")) return false;
      }
      return true;
    });
  }, [candidates, hrDataMap, fName, fUnit, fPosition, fTalent, fPcd, fNs, fHired, vacancies]);

  const hasFilters =
    !!fName ||
    fUnit !== "all" ||
    fPosition !== "all" ||
    fTalent !== "all" ||
    fPcd !== "all" ||
    fHired !== "all" ||
    fNs !== "all";

  const clearFilters = () => {
    setFName("");
    setFUnit("all");
    setFPosition("all");
    setFTalent("all");
    setFPcd("all");
    setFHired("all");
    setFNs("all");
  };

  const isTalent = (hr?: CandidateHRData) => !!hr?.evaluation?.talentBank;
  const isReprovado = (hr?: CandidateHRData) => {
    const ev = hr?.evaluation;
    if (!ev) return false;
    return (
      ev.fichaValidation === "Reprovada" ||
      ev.managementValidation === "Reprovada" ||
      ev.directorValidation === "Reprovada"
    );
  };
  const isArchived = (hr?: CandidateHRData) => isTalent(hr) || isReprovado(hr);

  // Toast on newly-archived candidates (persistence already confirmed upstream)
  const prevArchivedRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    const currentArchived = new Map<string, "talent" | "reprovado">();
    candidates.forEach((c) => {
      const hr = hrDataMap[c.id];
      if (isTalent(hr)) currentArchived.set(c.id, "talent");
      else if (isReprovado(hr)) currentArchived.set(c.id, "reprovado");
    });
    const prev = prevArchivedRef.current;
    if (prev) {
      currentArchived.forEach((kind, id) => {
        if (!prev.has(id)) {
          if (kind === "talent") toast("⭐ Candidato arquivado em Banco de Talentos.");
          else toast("🔴 Candidato arquivado em Reprovados.");
        }
      });
    }
    prevArchivedRef.current = new Set(currentArchived.keys());
  }, [candidates, hrDataMap]);

  const activeCandidates = filteredCandidates.filter((c) => !isArchived(hrDataMap[c.id]));
  const talentCandidates = filteredCandidates.filter((c) => isTalent(hrDataMap[c.id]));
  const reprovadoCandidates = filteredCandidates.filter(
    (c) => !isTalent(hrDataMap[c.id]) && isReprovado(hrDataMap[c.id])
  );

  const grouped: Record<CurrentStage, Candidate[]> = {
    validation_form: [],
    validation_manager: [],
    validation_director: [],
    proposal_presented: [],
    proposal_accepted: [],
    documentation: [],
    hired: [],
  };

  activeCandidates.forEach((c) => {
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
      onUpdateHRData?.({
        ...(hr as CandidateHRData),
        evaluation: prevEvaluation!,
      });
      toast.error("Não foi possível mover o candidato. Tente novamente.");
      return;
    }
    toast.success(`Candidato movido para ${CURRENT_STAGE_LABELS[targetStage]}.`);
  };

  const renderCard = (cand: Candidate, stageLabel: string, draggable: boolean) => {
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
    const isHired = ev?.candidateHired === "Sim";
    const docComplete = isDocumentationComplete(hr);
    const isDragging = draggingId === cand.id;
    const rel = relativeDate(cand.registrationDate);
    const stageStatus = ev?.currentStage
      ? getStageStatus(ev.currentStage as CurrentStage, hr)
      : "—";

    return (
      <Card
        key={cand.id}
        draggable={draggable && !isMobile}
        onDragStart={() => {
          if (!draggable || isMobile) return;
          setDraggingId(cand.id);
        }}
        onDragEnd={() => {
          setDraggingId(null);
          setDragOverStage(null);
        }}
        onClick={() => onSelectCandidate(cand)}
        className={`p-3 cursor-pointer hover:shadow-md transition-all bg-card ${
          isDragging ? "opacity-50" : ""
        } ${draggable && !isMobile ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        <div className="flex items-start gap-2">
          <Avatar className="h-10 w-10 flex-shrink-0">
            {cand.selfieUrl && (
              <SignedAvatarImage bucket="selfies" value={cand.selfieUrl} alt={cand.fullName} />
            )}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{cand.fullName}</div>
            {cand.desiredPosition1 && (
              <div className="text-xs text-muted-foreground truncate">{cand.desiredPosition1}</div>
            )}
            {unit && <div className="text-xs text-muted-foreground truncate">{unit}</div>}
            {shift && <div className="text-xs text-muted-foreground truncate">{shift}</div>}
            {rel && <div className="text-[10px] text-muted-foreground mt-0.5">{rel}</div>}
          </div>
        </div>

        {(ev?.pcd || ev?.talentBank || ev?.ns || hasInterview || isHired || docComplete) && (
          <div className="flex flex-wrap gap-1 mt-2">
            {ev?.pcd && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">PCD</Badge>}
            {ev?.talentBank && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Banco de Talentos</Badge>}
            {ev?.ns && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">N/S</Badge>}
            {hasInterview && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Entrevista Agendada</Badge>}
            {isHired && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Contratado</Badge>}
            {docComplete && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Documentação Completa</Badge>}
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between gap-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{stageLabel}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{stageStatus}</Badge>
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Pipeline mode selector */}
      <div className="inline-flex rounded-lg border border-border/60 bg-card p-1">
        <button
          type="button"
          onClick={() => setViewMode("active")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            viewMode === "active" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pipeline Ativo
        </button>
        <button
          type="button"
          onClick={() => setViewMode("closed")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            viewMode === "closed" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pipeline Encerrado
        </button>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg border border-border/60 bg-card p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          <Input
            placeholder="Nome do candidato"
            value={fName}
            onChange={(e) => setFName(e.target.value)}
            className="h-9"
          />
          <Select value={fUnit} onValueChange={setFUnit}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Loja / Unidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as unidades</SelectItem>
              {unitOptions.map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fPosition} onValueChange={setFPosition}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Vaga desejada" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as vagas</SelectItem>
              {positionOptions.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fTalent} onValueChange={setFTalent}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Banco de Talentos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Banco de Talentos: Todos</SelectItem>
              <SelectItem value="yes">Sim</SelectItem>
              <SelectItem value="no">Não</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fPcd} onValueChange={setFPcd}>
            <SelectTrigger className="h-9"><SelectValue placeholder="PCD" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">PCD: Todos</SelectItem>
              <SelectItem value="yes">Sim</SelectItem>
              <SelectItem value="no">Não</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fHired} onValueChange={setFHired}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Contratado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Contratado: Todos</SelectItem>
              <SelectItem value="yes">Sim</SelectItem>
              <SelectItem value="no">Não</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fNs} onValueChange={setFNs}>
            <SelectTrigger className="h-9"><SelectValue placeholder="N/S" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">N/S: Todos</SelectItem>
              <SelectItem value="yes">Sim</SelectItem>
              <SelectItem value="no">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <div className="flex justify-end mt-2">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-7">
          {CURRENT_STAGE_OPTIONS.map((stage) => {
            const list = grouped[stage];
            const summary = getStatusSummary(stage, list, hrDataMap);
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
                    {list.length} {list.length === 1 ? "candidato" : "candidatos"}
                  </div>
                  {summary.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {summary.map((s) => (
                        <span
                          key={s.label}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60"
                        >
                          {s.label}: {s.count}
                        </span>
                      ))}
                    </div>
                  )}
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
                      const isHired = ev?.candidateHired === "Sim";
                      const docComplete = isDocumentationComplete(hr);
                      const isDragging = draggingId === cand.id;
                      const rel = relativeDate(cand.registrationDate);

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
                              {rel && (
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                  {rel}
                                </div>
                              )}
                            </div>
                          </div>

                          {(ev?.pcd || ev?.talentBank || ev?.ns || hasInterview || isHired || docComplete) && (
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
                              {isHired && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  Contratado
                                </Badge>
                              )}
                              {docComplete && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  Documentação Completa
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
    </div>
  );
};
