import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toJpeg } from "html-to-image";
import type { Candidate } from "@/types/candidate";
import type { CandidateHRData } from "@/types/hr";
import { formatDateDisplay } from "@/utils/textFormatting";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  hrData: CandidateHRData;
}

const calculateAge = (birthDate: string) => {
  const parts = birthDate?.split("/");
  if (!parts || parts.length !== 3) return 0;
  const birth = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const CandidateCardDialog = ({ open, onOpenChange, candidate, hrData }: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const positions = [candidate.desiredPosition1, candidate.desiredPosition2, candidate.desiredPosition3]
    .filter((p): p is string => Boolean(p && p.trim()));

  const pcd = hrData?.evaluation?.pcd ? "Sim" : "Não";
  const age = candidate.birthDate ? calculateAge(candidate.birthDate) : 0;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toJpeg(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      const safeName = (candidate.fullName || "candidato").replace(/[^a-z0-9]+/gi, "_");
      link.download = `card_${safeName}.jpg`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="border-b border-gray-200 pb-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">{label}</p>
      <p className="text-sm text-gray-900 font-semibold mt-0.5 break-words">{value || "—"}</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-4">
        <DialogHeader>
          <DialogTitle>Card do Candidato</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center overflow-auto max-h-[70vh]">
          <div
            ref={cardRef}
            style={{ width: 540, fontFamily: "system-ui, -apple-system, sans-serif" }}
            className="bg-white"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-6 py-4">
              <p className="text-xs uppercase tracking-widest opacity-90">Ficha do Candidato</p>
              <p className="text-[10px] opacity-75 mt-1">Gerado em {formatDateDisplay(new Date().toLocaleDateString("pt-BR"))}</p>
            </div>

            {/* Photo + Name */}
            <div className="flex flex-col items-center px-6 pt-6 pb-4 bg-gray-50">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200 flex items-center justify-center">
                {candidate.selfieUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={candidate.selfieUrl}
                    alt={candidate.fullName}
                    crossOrigin="anonymous"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span className="text-4xl text-gray-400 font-bold">
                    {candidate.fullName?.charAt(0) || "?"}
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900 text-center">{candidate.fullName}</h2>
              <p className="text-sm text-gray-600 mt-1">{age} anos</p>
            </div>

            {/* Data */}
            <div className="px-6 py-5 space-y-3">
              <Field label="Nome da Mãe" value={candidate.motherName} />
              <Field label="WhatsApp" value={candidate.whatsapp} />
              <Field label="Instagram" value={candidate.instagram || "—"} />
              <Field label="Escolaridade" value={candidate.education} />
              <Field label="PCD" value={pcd} />
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Vagas Desejadas</p>
                {positions.length > 0 ? (
                  <ul className="mt-1 space-y-0.5">
                    {positions.map((p, i) => (
                      <li key={i} className="text-sm text-gray-900 font-semibold">• {p}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-900 font-semibold mt-0.5">—</p>
                )}
              </div>
            </div>

            <div className="bg-gray-100 px-6 py-2 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Compartilhamento Interno • RH</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={handleDownload} disabled={downloading}>
            <Download className="h-4 w-4 mr-2" />
            {downloading ? "Gerando..." : "Baixar JPG"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
