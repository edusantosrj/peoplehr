import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, File } from "lucide-react";
import type { Candidate } from "@/types/candidate";

interface ResumeBlockProps {
  candidate: Candidate;
}

export const ResumeBlock = ({ candidate }: ResumeBlockProps) => {
  const handleViewResume = () => {
    if (candidate.resumeUrl) {
      window.open(candidate.resumeUrl, '_blank');
    }
  };

  const handleViewOtherFiles = () => {
    if (candidate.otherFilesUrl) {
      window.open(candidate.otherFilesUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Currículo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {candidate.resumeUrl ? (
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleViewResume}
            >
              <FileText className="h-4 w-4" />
              Visualizar Currículo
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          ) : (
            <p className="text-muted-foreground text-center py-2">
              Nenhum currículo enviado.
            </p>
          )}

          {candidate.otherFilesUrl && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleViewOtherFiles}
            >
              <File className="h-4 w-4" />
              Outros Arquivos
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
