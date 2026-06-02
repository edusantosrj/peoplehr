import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatCPF, validateCPF } from "@/utils/cpfValidation";
import { AlertCircle, Loader2, Clock, Smartphone, ShieldCheck, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import team1 from "@/assets/team-1.jpg";
import team2 from "@/assets/team-2.jpg";
import team3 from "@/assets/team-3.jpg";
import team4 from "@/assets/team-4.jpg";
import team5 from "@/assets/team-5.jpg";

interface CpfPreCheckProps {
  onCpfValidated: (cpf: string) => void;
}

const teamAvatars = [
  { src: team1, alt: "Colaboradora" },
  { src: team2, alt: "Colaborador" },
  { src: team3, alt: "Colaborador" },
  { src: team4, alt: "Colaboradora" },
  { src: team5, alt: "Colaborador" },
];

export function CpfPreCheck({ onCpfValidated }: CpfPreCheckProps) {
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [cpfExists, setCpfExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
    setError("");
    setCpfExists(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, "");
    if (!validateCPF(cpf)) {
      setError("CPF inválido. Verifique os dígitos informados.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: queryError } = await supabase
        .rpc("candidate_cpf_exists", { p_cpf: cleanCpf });
      if (queryError) {
        onCpfValidated(cleanCpf);
        return;
      }
      if (data === true) {
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
    <div className="w-full max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-8 space-y-4">
        <h2 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight">
          <span className="text-gradient">Sua próxima oportunidade</span>
          <br />
          <span className="text-foreground">começa aqui!</span>
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          Plataforma de Recrutamento dos{" "}
          <span className="font-semibold text-foreground">Supermercados Marinho</span>
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/60 shadow-xs text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">5 minutos</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/60 shadow-xs text-xs sm:text-sm">
            <Smartphone className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">100% mobile</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/60 shadow-xs text-xs sm:text-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            <span className="font-medium">Dados Protegidos</span>
          </div>
        </div>

        {/* Team avatars */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="flex -space-x-3">
            {teamAvatars.map((a, i) => (
              <Avatar
                key={i}
                className="w-12 h-12 sm:w-14 sm:h-14 ring-4 ring-background shadow-md"
              >
                <AvatarImage src={a.src} alt={a.alt} loading="lazy" />
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Junte-se ao nosso time de colaboradores
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="relative rounded-2xl bg-card shadow-elevated border border-border/60 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary" />
        <div className="p-6 sm:p-8">
          {cpfExists ? (
            <Alert className="border-warning bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-foreground">
                Identificamos que já existe um cadastro realizado com o CPF informado.
                <br />
                <br />
                Para maiores informações, entre em contato com o RH do Supermercados Marinho.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="mb-6 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  Vamos começar? <span className="inline-block">👋</span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Digite seu CPF para iniciar sua candidatura
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-sm font-medium">
                    Seu CPF
                  </Label>
                  <Input
                    id="cpf"
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                    className="h-12 text-center text-lg tracking-wider"
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-95 shadow-glow"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      INICIAR
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
