import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, File } from "lucide-react";
import type { Candidate } from "@/types/candidate";
import { getSignedStorageUrl } from "@/lib/storagePath";

interface ResumeBlockProps {
  candidate: Candidate;
}

export const ResumeBlock = ({ candidate }: ResumeBlockProps) => {
  const otherFiles = candidate.otherFilesUrls || [];

  const fileNameFromUrl = (url: string) => {
    try {
      const decoded = decodeURIComponent(url.split('?')[0]);
      const last = decoded.split('/').pop() || 'arquivo';
      return last.replace(/^\d+_/, '');
    } catch {
      return 'arquivo';
    }
  };

  const openSigned = async (value: string) => {
    const url = await getSignedStorageUrl("documents", value);
    if (url) window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Currículo e Arquivos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {candidate.resumeUrl ? (
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => openSigned(candidate.resumeUrl!)}
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

          {otherFiles.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">Outros Arquivos</p>
              {otherFiles.map((url, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => openSigned(url)}
                >
                  <File className="h-4 w-4" />
                  <span className="truncate">{fileNameFromUrl(url)}</span>
                  <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
