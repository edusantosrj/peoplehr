import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield } from "lucide-react";

interface Step7Props {
  data: {
    lgpdConsent: boolean;
  };
  onChange: (field: string, value: boolean) => void;
  errors: Record<string, string>;
}

export function Step7LGPD({ data, onChange, errors }: Step7Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary">Termo de Consentimento LGPD</h3>
            <p className="text-sm text-muted-foreground">Lei Geral de Proteção de Dados</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-64 p-4">
              <div className="space-y-4 text-sm leading-relaxed">
                <p className="font-semibold">TERMO DE CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS</p>
                
                <p>
                  Eu, candidato(a) identificado(a) neste formulário, declaro estar ciente e de acordo com o tratamento 
                  dos meus dados pessoais pelo <strong>Supermercados Marinho</strong>, conforme as disposições da 
                  Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
                </p>

                <p className="font-semibold">1. Dados coletados:</p>
                <p>
                  Serão coletados os seguintes dados: nome completo, CPF, data de nascimento, estado civil, 
                  filiação, endereço, contatos (telefone, WhatsApp, redes sociais), escolaridade, cursos realizados, 
                  experiências profissionais, pretensões salariais e disponibilidade.
                </p>

                <p className="font-semibold">2. Finalidade do tratamento:</p>
                <p>
                  Os dados serão utilizados exclusivamente para fins de recrutamento e seleção de pessoal, 
                  análise de perfil profissional e eventual contratação.
                </p>

                <p className="font-semibold">3. Compartilhamento:</p>
                <p>
                  Os dados não serão compartilhados com terceiros, exceto quando necessário para cumprimento 
                  de obrigação legal ou regulatória.
                </p>

                <p className="font-semibold">4. Armazenamento:</p>
                <p>
                  Os dados serão armazenados em ambiente seguro pelo período necessário ao processo seletivo 
                  e, após, pelo prazo legal aplicável.
                </p>

                <p className="font-semibold">5. Direitos do titular:</p>
                <p>
                  O candidato poderá, a qualquer momento, solicitar acesso, correção, anonimização, 
                  bloqueio ou eliminação dos seus dados pessoais, mediante contato com o setor de 
                  Recursos Humanos.
                </p>

                <p className="font-semibold">6. Dados sensíveis:</p>
                <p>
                  Os dados referentes a antecedentes criminais são coletados mediante consentimento 
                  específico e tratados com sigilo absoluto, sendo utilizados exclusivamente para 
                  análise de compatibilidade com a vaga pretendida.
                </p>

                <p className="font-semibold">7. Revogação do consentimento:</p>
                <p>
                  O consentimento poderá ser revogado a qualquer momento, mediante solicitação 
                  expressa ao setor de Recursos Humanos, ficando ciente de que tal revogação 
                  poderá inviabilizar a participação no processo seletivo.
                </p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
          <Checkbox
            id="lgpdConsent"
            checked={data.lgpdConsent}
            onCheckedChange={(checked) => onChange("lgpdConsent", checked as boolean)}
          />
          <div className="space-y-1">
            <Label htmlFor="lgpdConsent" className="cursor-pointer font-medium">
              Declaro que li e aceito os termos acima *
            </Label>
            <p className="text-xs text-muted-foreground">
              Ao marcar esta opção, você consente com o tratamento dos seus dados pessoais 
              conforme descrito no termo acima.
            </p>
          </div>
        </div>
        {errors.lgpdConsent && <p className="text-sm text-destructive">{errors.lgpdConsent}</p>}
      </div>
    </div>
  );
}
