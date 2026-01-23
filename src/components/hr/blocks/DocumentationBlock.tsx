import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { CandidateDocumentation, DocumentStatus } from "@/types/hr";
import { DOCUMENT_LABELS } from "@/types/hr";

interface DocumentationBlockProps {
  documentation: CandidateDocumentation;
  onUpdate: (field: keyof CandidateDocumentation, key: 'checked' | 'expirationDate', value: boolean | string) => void;
}

export const getDocumentStatus = (expirationDate?: string): DocumentStatus | null => {
  if (!expirationDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 15) return 'expiring';
  return 'valid';
};

const StatusIcon = ({ status }: { status: DocumentStatus | null }) => {
  if (!status) return null;
  
  switch (status) {
    case 'valid':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'expiring':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'expired':
      return <XCircle className="h-4 w-4 text-red-600" />;
  }
};

const StatusBadge = ({ status }: { status: DocumentStatus | null }) => {
  if (!status) return null;
  
  const config = {
    valid: { label: 'Válido', className: 'bg-green-100 text-green-800' },
    expiring: { label: 'Vence em breve', className: 'bg-yellow-100 text-yellow-800' },
    expired: { label: 'Vencido', className: 'bg-red-100 text-red-800' },
  };
  
  const { label, className } = config[status];
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${className}`}>
      {label}
    </span>
  );
};

export const DocumentationBlock = ({ documentation, onUpdate }: DocumentationBlockProps) => {
  const documentKeys = Object.keys(DOCUMENT_LABELS) as (keyof CandidateDocumentation)[];
  
  const hasDateField = (key: keyof CandidateDocumentation) => {
    return key !== 'basicDocumentation';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentação do Candidato
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documentKeys.map((key) => {
          const doc = documentation[key];
          const status = hasDateField(key) ? getDocumentStatus(doc.expirationDate) : null;
          
          return (
            <div key={key} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`doc-${key}`}
                    checked={doc.checked}
                    onCheckedChange={(checked) => onUpdate(key, 'checked', !!checked)}
                  />
                  <Label htmlFor={`doc-${key}`} className="font-medium cursor-pointer">
                    {DOCUMENT_LABELS[key]}
                  </Label>
                  {status && <StatusIcon status={status} />}
                </div>
                {status && <StatusBadge status={status} />}
              </div>
              
              {hasDateField(key) && (
                <div className="ml-7">
                  <Label className="text-sm text-muted-foreground">Data de Vencimento</Label>
                  <Input
                    type="date"
                    value={doc.expirationDate || ''}
                    onChange={(e) => onUpdate(key, 'expirationDate', e.target.value)}
                    className="mt-1 max-w-xs"
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
