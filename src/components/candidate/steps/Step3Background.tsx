import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

interface Step3Props {
  data: {
    hasCriminalRecord: boolean;
  };
  onChange: (field: string, value: boolean) => void;
}

export function Step3Background({ data, onChange }: Step3Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Antecedentes</h3>
        
        <div className="space-y-4">
          <Label className="text-base">Possui antecedentes criminais?</Label>
          <RadioGroup
            value={data.hasCriminalRecord ? "yes" : "no"}
            onValueChange={(v) => onChange("hasCriminalRecord", v === "yes")}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="record-yes" />
              <Label htmlFor="record-yes" className="font-normal cursor-pointer">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="record-no" />
              <Label htmlFor="record-no" className="font-normal cursor-pointer">Não</Label>
            </div>
          </RadioGroup>
        </div>

        <Alert className="border-primary/20 bg-primary/5">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            Este dado é sensível e será tratado com total sigilo, conforme a Lei Geral de Proteção de Dados (LGPD).
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
