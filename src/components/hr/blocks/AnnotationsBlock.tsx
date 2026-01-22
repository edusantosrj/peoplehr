import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Plus, Clock } from "lucide-react";
import type { HRAnnotation } from "@/types/hr";

interface AnnotationsBlockProps {
  annotations: HRAnnotation[];
  onAddAnnotation: (text: string) => void;
}

export const AnnotationsBlock = ({
  annotations,
  onAddAnnotation,
}: AnnotationsBlockProps) => {
  const [newAnnotation, setNewAnnotation] = useState("");

  const handleAddAnnotation = () => {
    if (newAnnotation.trim()) {
      onAddAnnotation(newAnnotation.trim());
      setNewAnnotation("");
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Sort by date, most recent first
  const sortedAnnotations = [...annotations].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Anotações do RH
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Digite uma nova anotação..."
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleAddAnnotation}
            disabled={!newAnnotation.trim()}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Anotação
          </Button>
        </div>

        {sortedAnnotations.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm text-muted-foreground font-medium">
              Histórico de Anotações
            </p>
            {sortedAnnotations.map((annotation) => (
              <div
                key={annotation.id}
                className="p-3 rounded-lg bg-muted/50 space-y-1"
              >
                <p className="text-sm">{annotation.text}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(annotation.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
