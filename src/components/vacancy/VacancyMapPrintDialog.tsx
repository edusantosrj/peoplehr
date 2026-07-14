import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer } from 'lucide-react';
import type { Vacancy } from '@/types/vacancy';
import { formatWorkHours } from '@/types/vacancy';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  vacancies: Vacancy[];
}

const stripHtml = (html?: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const renderVacancyCard = (v: Vacancy) => {
  const obs = stripHtml(v.observation);
  return `
    <div class="card">
      <div class="card-head">
        <h4>${escapeHtml(v.name)}</h4>
        <span class="badge">${v.quantity} vaga${v.quantity !== 1 ? 's' : ''}</span>
      </div>
      <div class="card-body">
        <div><strong>Setor:</strong> ${escapeHtml(v.sector)}</div>
        <div><strong>Turno:</strong> ${escapeHtml(v.shift)}</div>
        <div><strong>Horário:</strong> ${escapeHtml(formatWorkHours(v.workHoursStart, v.workHoursEnd))}</div>
        <div><strong>Tipo:</strong> ${escapeHtml(v.type)}</div>
        ${obs ? `<div class="obs"><strong>Observação:</strong> ${escapeHtml(obs)}</div>` : ''}
      </div>
    </div>
  `;
};

const renderUnitPage = (unit: string, vacancies: Vacancy[], isLast: boolean) => {
  const nova = vacancies.filter((v) => v.type === 'Nova Contratação');
  const subs = vacancies.filter((v) => v.type === 'Substituição');
  const total = vacancies.reduce((s, v) => s + v.quantity, 0);

  const section = (title: string, list: Vacancy[]) => {
    if (list.length === 0) return '';
    const t = list.reduce((s, v) => s + v.quantity, 0);
    return `
      <div class="section">
        <div class="section-head"><span class="type-badge">${title}</span> <span class="muted">(${t} vaga${t !== 1 ? 's' : ''})</span></div>
        <div class="cards">${list.map(renderVacancyCard).join('')}</div>
      </div>
    `;
  };

  return `
    <section class="unit-page ${isLast ? 'last' : ''}">
      <h2 class="unit-title">${escapeHtml(unit)} <span class="unit-total">— ${total} vaga${total !== 1 ? 's' : ''} ativa${total !== 1 ? 's' : ''}</span></h2>
      ${vacancies.length === 0 ? '<p class="muted">Nenhuma vaga ativa nesta unidade.</p>' : ''}
      ${section('Nova Contratação', nova)}
      ${section('Substituição', subs)}
    </section>
  `;
};

export const VacancyMapPrintDialog = ({ open, onOpenChange, vacancies }: Props) => {
  const [scope, setScope] = useState<'all' | 'one'>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  const activeVacancies = useMemo(() => vacancies.filter((v) => v.status === 'Ativa'), [vacancies]);

  const units = useMemo(() => {
    const set = new Set(activeVacancies.map((v) => v.unit));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [activeVacancies]);

  const handlePrint = () => {
    const chosen = scope === 'all' ? units : [selectedUnit].filter(Boolean);
    if (chosen.length === 0) return;

    const today = new Date().toLocaleDateString('pt-BR');

    const body = chosen
      .map((unit, idx) => {
        const list = activeVacancies.filter((v) => v.unit === unit);
        return renderUnitPage(unit, list, idx === chosen.length - 1);
      })
      .join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8" /><title>Mapa Estratégico de Vagas</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 24px; font-size: 12px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0a7a3b; padding-bottom: 8px; margin-bottom: 8px; }
  .brand h1 { margin: 0; font-size: 16px; color: #0a7a3b; }
  .brand p { margin: 2px 0 0; font-size: 11px; color: #444; }
  .print-date { font-size: 11px; text-align: right; }
  .doc-title { text-align: center; font-size: 18px; font-weight: bold; letter-spacing: 1px; margin: 12px 0 20px; }
  .unit-page { page-break-after: always; }
  .unit-page.last { page-break-after: auto; }
  .unit-title { font-size: 15px; color: #0a7a3b; border-left: 4px solid #0a7a3b; padding-left: 8px; margin: 0 0 12px; }
  .unit-total { font-size: 12px; color: #555; font-weight: normal; }
  .section { margin-bottom: 14px; }
  .section-head { margin-bottom: 6px; }
  .type-badge { background: #0a7a3b; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
  .muted { color: #666; font-size: 11px; }
  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .card { border: 1px solid #ccc; border-radius: 6px; padding: 8px; break-inside: avoid; }
  .card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .card-head h4 { margin: 0; font-size: 13px; }
  .badge { border: 1px solid #999; border-radius: 10px; padding: 1px 6px; font-size: 10px; }
  .card-body div { margin: 2px 0; font-size: 11px; }
  .obs { margin-top: 4px; padding-top: 4px; border-top: 1px dashed #ccc; }
  .footer { position: fixed; bottom: 12px; left: 24px; right: 24px; border-top: 1px solid #999; padding-top: 6px; font-size: 10px; color: #333; }
  .footer .leg { display: flex; gap: 20px; }
  .footer .leg div { flex: 1; }
  @page { margin: 20mm 12mm 28mm 12mm; }
</style>
</head><body>
  <div class="header">
    <div class="brand">
      <h1>Supermercados Marinho</h1>
      <p>Sistema de Recursos Humanos</p>
    </div>
    <div class="print-date">Data da impressão<br/><strong>${today}</strong></div>
  </div>
  <div class="doc-title">MAPA ESTRATÉGICO DE VAGAS</div>
  ${body}
  <div class="footer">
    <div class="leg">
      <div><strong>Nova Contratação:</strong> Posição de trabalho sem funcionário.</div>
      <div><strong>Substituição:</strong> Vaga destinada à substituição de funcionário em aviso prévio ou planejado para desligamento.</div>
    </div>
  </div>
  <script>window.onload = () => { setTimeout(() => { window.print(); }, 200); };</script>
</body></html>`;

    const w = window.open('', '_blank', 'width=1000,height=800');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Imprimir Mapa Estratégico</DialogTitle>
        </DialogHeader>

        <RadioGroup value={scope} onValueChange={(v) => setScope(v as 'all' | 'one')} className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="scope-all" />
            <Label htmlFor="scope-all">Todas as Unidades</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one" id="scope-one" />
            <Label htmlFor="scope-one">Selecionar Unidade</Label>
          </div>
        </RadioGroup>

        {scope === 'one' && (
          <div className="mt-2">
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent>
                {units.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhuma unidade com vagas ativas</div>
                ) : (
                  units.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handlePrint}
            disabled={scope === 'one' ? !selectedUnit : units.length === 0}
          >
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
