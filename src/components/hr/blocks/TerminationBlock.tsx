import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserMinus, Save, AlertTriangle } from "lucide-react";
import type { Termination } from "@/types/hr";

interface TerminationBlockProps {
  termination: Termination;
  onUpdate: (field: keyof Termination, value: string | boolean | number) => void;
  onSave: () => void;
}

export const TerminationBlock = ({
  termination,
  onUpdate,
  onSave,
}: TerminationBlockProps) => {
  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-destructive">
          <UserMinus className="h-5 w-5" />
          Desligamento do Funcionário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Após confirmar o desligamento, atualize manualmente a quantidade da vaga no cadastro de vagas.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data do Pedido de Desligamento</Label>
            <Input
              type="date"
              value={termination.requestDate || ''}
              onChange={(e) => onUpdate('requestDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Pedido de Desligamento Voluntário?</Label>
            <Select
              value={termination.voluntaryTermination === undefined ? '' : termination.voluntaryTermination ? 'sim' : 'nao'}
              onValueChange={(value) => onUpdate('voluntaryTermination', value === 'sim')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Motivo do Desligamento</Label>
            <Textarea
              placeholder="Descreva o motivo do desligamento..."
              value={termination.terminationReason || ''}
              onChange={(e) => onUpdate('terminationReason', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Funcionário Vai Cumprir Aviso Prévio?</Label>
            <Select
              value={termination.willServeNotice === undefined ? '' : termination.willServeNotice ? 'sim' : 'nao'}
              onValueChange={(value) => onUpdate('willServeNotice', value === 'sim')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {termination.willServeNotice && (
            <div className="space-y-2">
              <Label>Quantos Dias?</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={termination.noticeDays || ''}
                onChange={(e) => onUpdate('noticeDays', parseInt(e.target.value) || 0)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Funcionário Vai Trabalhar Até Qual Dia</Label>
            <Input
              type="date"
              value={termination.lastWorkDay || ''}
              onChange={(e) => onUpdate('lastWorkDay', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Funcionário Pode Ser Contratado Novamente?</Label>
            <Select
              value={termination.canBeRehired === undefined ? '' : termination.canBeRehired ? 'sim' : 'nao'}
              onValueChange={(value) => onUpdate('canBeRehired', value === 'sim')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4 border-t">
          <Checkbox
            id="confirmTermination"
            checked={termination.confirmed || false}
            onCheckedChange={(checked) => onUpdate('confirmed', !!checked)}
          />
          <Label htmlFor="confirmTermination" className="text-sm font-normal">
            Confirmo o desligamento deste funcionário
          </Label>
        </div>

        <Button
          onClick={onSave}
          variant="destructive"
          disabled={!termination.confirmed}
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Desligamento
        </Button>
      </CardContent>
    </Card>
  );
};
