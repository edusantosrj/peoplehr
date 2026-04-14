import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, X, Camera, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step6Props {
  data: {
    resumeFile: File | null;
    otherFiles: File[];
    selfieFile: File | null;
  };
  onChange: (field: string, value: File | null | File[]) => void;
  errors: Record<string, string>;
}

export function Step6Uploads({ data, onChange, errors }: Step6Props) {
  const [cameraActive, setCameraActive] = useState(false);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [pendingSelfie, setPendingSelfie] = useState<{ file: File; url: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setPendingSelfie({ file, url });
        stopCamera();
      },
      "image/jpeg",
      0.85
    );
  }, [stopCamera]);

  const confirmSelfie = useCallback(() => {
    if (!pendingSelfie) return;
    onChange("selfieFile", pendingSelfie.file);
    setSelfiePreview(pendingSelfie.url);
    setPendingSelfie(null);
  }, [pendingSelfie, onChange]);

  const redoSelfie = useCallback(() => {
    if (pendingSelfie) {
      URL.revokeObjectURL(pendingSelfie.url);
      setPendingSelfie(null);
    }
    startCamera();
  }, [pendingSelfie, startCamera]);

  const removeSelfie = useCallback(() => {
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfiePreview(null);
    setPendingSelfie(null);
    onChange("selfieFile", null);
  }, [selfiePreview, onChange]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Upload de Arquivos</h3>

        {/* Selfie Section */}
        <div className="space-y-2">
          <Label>Selfie (Foto do Rosto) *</Label>

          {/* Confirmed selfie */}
          {data.selfieFile && selfiePreview && !pendingSelfie && !cameraActive && (
            <Card className="border-2 border-primary/30">
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={selfiePreview}
                    alt="Selfie"
                    className="w-40 h-40 object-cover rounded-full border-2 border-primary"
                  />
                  <p className="text-sm text-primary font-medium">Selfie confirmada ✓</p>
                  <Button type="button" variant="outline" size="sm" onClick={redoSelfie}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refazer Selfie
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending confirmation */}
          {pendingSelfie && !cameraActive && (
            <Card className="border-2 border-amber-400">
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={pendingSelfie.url}
                    alt="Pré-visualização"
                    className="w-40 h-40 object-cover rounded-full border-2 border-amber-400"
                  />
                  <p className="text-sm text-muted-foreground">Confirme ou refaça a selfie</p>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={confirmSelfie}>
                      <Check className="w-4 h-4 mr-2" />
                      Confirmar
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={redoSelfie}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refazer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Camera active */}
          {cameraActive && (
            <Card className="border-2 border-primary">
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-3">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-w-xs rounded-lg"
                  />
                  <div className="flex gap-2">
                    <Button type="button" onClick={capturePhoto}>
                      <Camera className="w-4 h-4 mr-2" />
                      Capturar
                    </Button>
                    <Button type="button" variant="outline" onClick={stopCamera}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Initial state - no selfie */}
          {!data.selfieFile && !pendingSelfie && !cameraActive && (
            <Card
              className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={startCamera}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para abrir a câmera e tirar uma selfie
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <canvas ref={canvasRef} className="hidden" />
          {errors.selfieFile && <p className="text-sm text-destructive">{errors.selfieFile}</p>}
        </div>

        {/* Resume Section - unchanged */}
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

        {/* Other files - unchanged */}
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
  );
}
