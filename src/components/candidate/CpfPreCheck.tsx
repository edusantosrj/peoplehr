import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCPF, validateCPF } from "@/utils/cpfValidation";
import { UserCheck, AlertCircle } from "lucide-react";

interface CpfPreCheckProps {
  onCpfValidated: (cpf: string) => void;
  existingCpfs: string[];
}

export function CpfPreCheck({ onCpfValidated, existingCpfs }: CpfPreCheckProps) {
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [cpfExists, setCpfExists] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
    setError("");
    setCpfExists(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (!validateCPF(cpf)) {
      setError("CPF inválido. Verifique os dígitos informados.");
      return;
    }
    
    // Check if CPF already exists
    if (existingCpfs.includes(cleanCpf)) {
      setCpfExists(true);
      return;
    }
    
    onCpfValidated(cleanCpf);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Cadastro de Candidato</CardTitle>
        <CardDescription>
          Informe seu CPF para iniciar o cadastro
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cpfExists ? (
          <Alert className="border-warning bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-foreground">
              Identificamos que já existe um cadastro realizado com o CPF informado.
              <br /><br />
              Para maiores informações, entre em contato com o RH do Supermercados Marinho.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                maxLength={14}
                className="text-center text-lg tracking-wider"
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Continuar
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
