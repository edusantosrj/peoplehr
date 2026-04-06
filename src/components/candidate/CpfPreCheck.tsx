import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCPF, validateCPF } from "@/utils/cpfValidation";
import { UserCheck, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CpfPreCheckProps {
  onCpfValidated: (cpf: string) => void;
}

export function CpfPreCheck({ onCpfValidated }: CpfPreCheckProps) {
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [cpfExists, setCpfExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
    setError("");
    setCpfExists(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (!validateCPF(cpf)) {
      setError("CPF inválido. Verifique os dígitos informados.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: queryError } = await supabase
        .from("candidates")
        .select("id")
        .eq("cpf", cleanCpf)
        .maybeSingle();

      if (queryError) {
        // If RLS blocks SELECT for anon, treat as "not found" (new candidate)
        onCpfValidated(cleanCpf);
        return;
      }

      if (data) {
        setCpfExists(true);
        return;
      }

      onCpfValidated(cleanCpf);
    } catch {
      onCpfValidated(cleanCpf);
    } finally {
      setLoading(false);
    }
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Continuar
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
