import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import type { Candidate } from "@/types/candidate";

interface PersonalDataBlockProps {
  candidate: Candidate;
}

export const PersonalDataBlock = ({ candidate }: PersonalDataBlockProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-primary" />
          Dados Pessoais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Data de Nascimento</p>
            <p className="font-medium">
              {formatDate(candidate.birthDate)} ({calculateAge(candidate.birthDate)} anos)
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estado Civil</p>
            <p className="font-medium">{candidate.maritalStatus}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nome da Mãe</p>
            <p className="font-medium">{candidate.motherName}</p>
          </div>
          {candidate.fatherName && (
            <div>
              <p className="text-sm text-muted-foreground">Nome do Pai</p>
              <p className="font-medium">{candidate.fatherName}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">WhatsApp</p>
            <p className="font-medium">{candidate.whatsapp}</p>
          </div>
          {candidate.instagram && (
            <div>
              <p className="text-sm text-muted-foreground">Instagram</p>
              <p className="font-medium">{candidate.instagram}</p>
            </div>
          )}
          {candidate.facebook && (
            <div>
              <p className="text-sm text-muted-foreground">Facebook</p>
              <p className="font-medium">{candidate.facebook}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
