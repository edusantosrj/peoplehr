import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function SuccessScreen() {
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg text-center">
      <CardHeader>
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <CardTitle className="text-2xl text-success">Cadastro Realizado!</CardTitle>
        <CardDescription className="text-base">
          Seus dados foram enviados com sucesso.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Agradecemos seu interesse em fazer parte da equipe do 
          <strong className="text-foreground"> Supermercados Marinho</strong>.
        </p>
        <p className="text-sm text-muted-foreground">
          Nosso setor de Recursos Humanos analisará seu perfil e, 
          caso haja compatibilidade com nossas vagas, entraremos em contato.
        </p>
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Data do cadastro: {new Date().toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
