import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step6Props {
  data: {
    resumeFile: File | null;
    otherFiles: File[];
  };
  onChange: (field: string, value: File | null | File[]) => void;
  errors: Record<string, string>;
}

export function Step6Uploads({ data, onChange, errors }: Step6Props) {
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange("resumeFile", file);
  };

  const handleOtherFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onChange("otherFiles", [...data.otherFiles, ...files]);
  };

  const removeOtherFile = (index: number) => {
    const newFiles = data.otherFiles.filter((_, i) => i !== index);
    onChange("otherFiles", newFiles);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Upload de Arquivos</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume">Currículo *</Label>
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <label htmlFor="resume" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    {data.resumeFile ? (
                      <>
                        <FileText className="w-12 h-12 text-primary" />
                        <p className="text-sm font-medium">{data.resumeFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(data.resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Clique para selecionar ou arraste seu currículo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, DOCX (máx. 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeChange}
                />
              </CardContent>
            </Card>
            {errors.resumeFile && <p className="text-sm text-destructive">{errors.resumeFile}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherFiles">Outros Arquivos (opcional)</Label>
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <label htmlFor="otherFiles" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Certificados, comprovantes, etc.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX, JPG, PNG (máx. 5MB cada)
                    </p>
                  </div>
                </label>
                <Input
                  id="otherFiles"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  multiple
                  onChange={handleOtherFilesChange}
                />
              </CardContent>
            </Card>
          </div>

          {data.otherFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Arquivos selecionados:</Label>
              <div className="space-y-2">
                {data.otherFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOtherFile(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
