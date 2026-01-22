import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, AlertTriangle } from "lucide-react";
import type { Candidate } from "@/types/candidate";

interface EducationBlockProps {
  candidate: Candidate;
}

export const EducationBlock = ({ candidate }: EducationBlockProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5 text-primary" />
          Escolaridade e Cursos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Escolaridade</p>
            <p className="font-medium">{candidate.education}</p>
          </div>
          {candidate.course && (
            <div>
              <p className="text-sm text-muted-foreground">Curso</p>
              <p className="font-medium">{candidate.course}</p>
            </div>
          )}
          {candidate.period && (
            <div>
              <p className="text-sm text-muted-foreground">Período</p>
              <p className="font-medium">{candidate.period}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Possui Curso Técnico</p>
            <p className="font-medium">{candidate.hasTechnicalCourse ? 'Sim' : 'Não'}</p>
          </div>
        </div>

        {candidate.completedCourses.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Cursos Realizados</p>
            <div className="flex flex-wrap gap-2">
              {candidate.completedCourses.map((course, index) => (
                <Badge key={index} variant="secondary">
                  {course}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {candidate.otherCourses && (
          <div>
            <p className="text-sm text-muted-foreground">Outros Cursos</p>
            <p className="font-medium">{candidate.otherCourses}</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Antecedentes Criminais</p>
          </div>
          <p className="font-medium mt-1">
            {candidate.hasCriminalRecord ? 'Sim' : 'Não'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
