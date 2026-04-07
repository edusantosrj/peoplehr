import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatPhone } from "@/utils/cpfValidation";
import { Plus, Trash2, Briefcase } from "lucide-react";
import { WorkExperience } from "@/types/candidate";
import { capitalizeProperName } from "@/utils/textFormatting";

interface Step4Props {
  data: {
    workExperiences: WorkExperience[];
  };
  onChange: (field: string, value: WorkExperience[]) => void;
  errors: Record<string, string>;
}

const emptyExperience: Omit<WorkExperience, 'id'> = {
  company: "",
  position: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  reasonForLeaving: "",
  referenceName: "",
  referencePhone: ""
};

export function Step4Experience({ data, onChange, errors }: Step4Props) {
  const addExperience = () => {
    const newExperience: WorkExperience = {
      ...emptyExperience,
      id: crypto.randomUUID()
    };
    onChange("workExperiences", [...data.workExperiences, newExperience]);
  };

  const removeExperience = (id: string) => {
    onChange("workExperiences", data.workExperiences.filter(exp => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    const updated = data.workExperiences.map(exp => {
      if (exp.id === id) {
        const updatedExp = { ...exp, [field]: value };
        // Clear end date if currently working
        if (field === 'currentlyWorking' && value === true) {
          updatedExp.endDate = "";
          updatedExp.reasonForLeaving = "";
        }
        return updatedExp;
      }
      return exp;
    });
    onChange("workExperiences", updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">Experiências Profissionais</h3>
        <Button type="button" onClick={addExperience} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {data.workExperiences.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Briefcase className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">Nenhuma experiência profissional adicionada.</p>
            <p className="text-sm">Clique em "Adicionar" para incluir suas experiências.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.workExperiences.map((exp, index) => (
            <Card key={exp.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Experiência {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(exp.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Empresa *</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      onBlur={(e) => updateExperience(exp.id, 'company', capitalizeProperName(e.target.value))}
                      placeholder="Nome da empresa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cargo *</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                      onBlur={(e) => updateExperience(exp.id, 'position', capitalizeProperName(e.target.value))}
                      placeholder="Cargo exercido"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Entrada *</Label>
                    <Input
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', formatDate(e.target.value))}
                      placeholder="DD/MM/AAAA"
                      maxLength={10}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Trabalhando Atualmente?</Label>
                    <RadioGroup
                      value={exp.currentlyWorking ? "yes" : "no"}
                      onValueChange={(v) => updateExperience(exp.id, 'currentlyWorking', v === "yes")}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`current-yes-${exp.id}`} />
                        <Label htmlFor={`current-yes-${exp.id}`} className="font-normal cursor-pointer">Sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`current-no-${exp.id}`} />
                        <Label htmlFor={`current-no-${exp.id}`} className="font-normal cursor-pointer">Não</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {!exp.currentlyWorking && (
                    <>
                      <div className="space-y-2">
                        <Label>Data de Saída</Label>
                        <Input
                          value={exp.endDate || ""}
                          onChange={(e) => updateExperience(exp.id, 'endDate', formatDate(e.target.value))}
                          placeholder="DD/MM/AAAA"
                          maxLength={10}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label>Motivo da Saída</Label>
                        <Textarea
                          value={exp.reasonForLeaving || ""}
                          onChange={(e) => updateExperience(exp.id, 'reasonForLeaving', e.target.value)}
                          placeholder="Descreva o motivo da saída..."
                          rows={2}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Nome da Referência *</Label>
                    <Input
                      value={exp.referenceName}
                      onChange={(e) => updateExperience(exp.id, 'referenceName', e.target.value)}
                      onBlur={(e) => updateExperience(exp.id, 'referenceName', capitalizeProperName(e.target.value))}
                      placeholder="Nome do contato de referência"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Telefone da Referência *</Label>
                    <Input
                      value={exp.referencePhone}
                      onChange={(e) => updateExperience(exp.id, 'referencePhone', formatPhone(e.target.value))}
                      placeholder="(00) 0 0000-0000"
                      maxLength={16}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {errors.workExperiences && (
        <p className="text-sm text-destructive">{errors.workExperiences}</p>
      )}
    </div>
  );
}
