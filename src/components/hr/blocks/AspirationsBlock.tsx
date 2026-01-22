import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle, XCircle } from "lucide-react";
import type { Candidate } from "@/types/candidate";

interface AspirationsBlockProps {
  candidate: Candidate;
}

export const AspirationsBlock = ({ candidate }: AspirationsBlockProps) => {
  const AvailabilityBadge = ({ available, label }: { available: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      {available ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className="text-sm">{label}</span>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Pretensões e Disponibilidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Pretensão Salarial</p>
            <p className="font-medium text-lg">{candidate.salaryExpectation}</p>
          </div>
          <div className="space-y-2">
            <AvailabilityBadge 
              available={candidate.immediateStart} 
              label="Início Imediato" 
            />
            <AvailabilityBadge 
              available={candidate.availableWeekends} 
              label="Trabalhar Finais de Semana" 
            />
            <AvailabilityBadge 
              available={candidate.availableHolidays} 
              label="Trabalhar Feriados" 
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Vagas Desejadas</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{candidate.desiredPosition1}</Badge>
            {candidate.desiredPosition2 && (
              <Badge variant="secondary">{candidate.desiredPosition2}</Badge>
            )}
            {candidate.desiredPosition3 && (
              <Badge variant="secondary">{candidate.desiredPosition3}</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
