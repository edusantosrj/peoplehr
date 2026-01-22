import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Phone, User } from "lucide-react";
import type { WorkExperience } from "@/types/candidate";

interface ExperienceBlockProps {
  experiences: WorkExperience[];
}

export const ExperienceBlock = ({ experiences }: ExperienceBlockProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
  };

  // Sort by start date, most recent first
  const sortedExperiences = [...experiences].sort((a, b) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Briefcase className="h-5 w-5 text-primary" />
          Experiências Profissionais
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedExperiences.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma experiência profissional cadastrada.
          </p>
        ) : (
          <div className="space-y-4">
            {sortedExperiences.map((exp, index) => (
              <div
                key={exp.id}
                className={`p-4 rounded-lg bg-muted/50 ${
                  index < sortedExperiences.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{exp.position}</h4>
                    <p className="text-muted-foreground">{exp.company}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(exp.startDate)} -{' '}
                    {exp.currentlyWorking ? (
                      <span className="text-primary font-medium">Atual</span>
                    ) : (
                      exp.endDate && formatDate(exp.endDate)
                    )}
                  </div>
                </div>

                {exp.reasonForLeaving && !exp.currentlyWorking && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Motivo da Saída:</p>
                    <p className="text-sm">{exp.reasonForLeaving}</p>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Referência:</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="flex items-center gap-1 text-sm">
                      <User className="h-3 w-3" />
                      {exp.referenceName}
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      {exp.referencePhone}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
