import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { User } from "lucide-react";

interface CandidateProfileHeaderProps {
  photoUrl?: string;
  fullName: string;
  cpf: string;
  registrationDate: string;
}

export const CandidateProfileHeader = ({
  photoUrl,
  fullName,
  cpf,
  registrationDate,
}: CandidateProfileHeaderProps) => {
  const [imageOpen, setImageOpen] = useState(false);

  const formatCpf = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Dialog open={imageOpen} onOpenChange={setImageOpen}>
            <DialogTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
                <Avatar className="h-24 w-24 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={photoUrl} alt={fullName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {photoUrl ? getInitials(fullName) : <User className="h-12 w-12" />}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName}
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                  <User className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-foreground">{fullName}</h2>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <p>
                <span className="font-medium">CPF:</span> {formatCpf(cpf)}
              </p>
              <p>
                <span className="font-medium">Cadastrado em:</span>{" "}
                {formatDate(registrationDate)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
