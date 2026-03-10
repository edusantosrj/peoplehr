import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Save, X, Trash2 } from 'lucide-react';
import type { Vacancy } from '@/types/vacancy';
import { VACANCY_TYPES, VACANCY_STATUS } from '@/types/vacancy';
import { useVacancies } from '@/contexts/VacancyContext';

interface VacancyFormProps {
  vacancy?: Vacancy;
  onSave: () => void;
  onCancel: () => void;
}

export const VacancyForm = ({ vacancy, onSave, onCancel }: VacancyFormProps) => {
  const {
    sectors, units, shifts,
    addVacancy, updateVacancy,
    addSector, removeSector,
    addUnit, removeUnit,
    addShift, removeShift,
  } = useVacancies();

  const [newSector, setNewSector] = useState('');
  const [showNewSector, setShowNewSector] = useState(false);

  const [newUnit, setNewUnit] = useState('');
  const [showNewUnit, setShowNewUnit] = useState(false);

  const [newShift, setNewShift] = useState('');
  const [showNewShift, setShowNewShift] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'unit' | 'shift' | 'sector';
    items: string[];
  }>({ open: false, type: 'unit', items: [] });

  const [formData, setFormData] = useState<Partial<Vacancy>>({
    name: vacancy?.name || '',
    unit: vacancy?.unit || '',
    shift: vacancy?.shift || '',
    sector: vacancy?.sector || '',
    type: vacancy?.type || 'Nova Contratação',
    quantity: vacancy?.quantity || 1,
    workHoursStart: vacancy?.workHoursStart || '',
    workHoursEnd: vacancy?.workHoursEnd || '',
    grossSalary: vacancy?.grossSalary || 0,
    status: vacancy?.status || 'Ativa',
  });

  const handleChange = (field: keyof Vacancy, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const numValue = parseInt(value, 10) / 100;
    handleChange('grossSalary', isNaN(numValue) ? 0 : numValue);
  };

  const formatSalaryDisplay = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleAddNewSector = () => {
    if (newSector.trim()) {
      addSector(newSector.trim());
      handleChange('sector', newSector.trim());
      setNewSector('');
      setShowNewSector(false);
    }
  };

  const handleAddNewUnit = () => {
    if (newUnit.trim()) {
      addUnit(newUnit.trim());
      handleChange('unit', newUnit.trim());
      setNewUnit('');
      setShowNewUnit(false);
    }
  };

  const handleAddNewShift = () => {
    if (newShift.trim()) {
      addShift(newShift.trim());
      handleChange('shift', newShift.trim());
      setNewShift('');
      setShowNewShift(false);
    }
  };

  const handleDeleteItem = (type: 'unit' | 'shift' | 'sector', item: string) => {
    if (type === 'unit') {
      removeUnit(item);
      if (formData.unit === item) handleChange('unit', '');
    } else if (type === 'shift') {
      removeShift(item);
      if (formData.shift === item) handleChange('shift', '');
    } else {
      removeSector(item);
      if (formData.sector === item) handleChange('sector', '');
    }
  };

  const openDeleteDialog = (type: 'unit' | 'shift' | 'sector') => {
    const items = type === 'unit' ? units : type === 'shift' ? shifts : sectors;
    setDeleteDialog({ open: true, type, items });
  };

  const getDeleteDialogTitle = () => {
    switch (deleteDialog.type) {
      case 'unit': return 'Excluir Unidade';
      case 'shift': return 'Excluir Turno';
      case 'sector': return 'Excluir Setor';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (vacancy) {
      updateVacancy(vacancy.id, formData);
    } else {
      const newVacancy: Vacancy = {
        id: Date.now().toString(),
        name: formData.name || '',
        unit: formData.unit || '',
        shift: formData.shift || '',
        sector: formData.sector || '',
        type: formData.type || 'Nova Contratação',
        quantity: formData.quantity || 1,
        workHoursStart: formData.workHoursStart || '',
        workHoursEnd: formData.workHoursEnd || '',
        grossSalary: formData.grossSalary || 0,
        status: formData.status || 'Ativa',
        createdAt: new Date().toISOString(),
      };
      addVacancy(newVacancy);
    }
    onSave();
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">
            {vacancy ? 'Editar Vaga' : 'Cadastrar Nova Vaga'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identification */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Identificação da Vaga</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Vaga *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ex: Operador de Caixa"
                    required
                  />
                </div>

                {/* Unidade / Loja */}
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade / Loja *</Label>
                  {showNewUnit ? (
                    <div className="flex gap-2">
                      <Input
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                        placeholder="Nome da nova unidade"
                      />
                      <Button type="button" size="icon" onClick={handleAddNewUnit}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setShowNewUnit(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => handleChange('unit', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setShowNewUnit(true)}
                        title="Incluir nova unidade"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => openDeleteDialog('unit')}
                        title="Excluir unidade existente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Turno da Vaga */}
                <div className="space-y-2">
                  <Label htmlFor="shift">Turno da Vaga *</Label>
                  {showNewShift ? (
                    <div className="flex gap-2">
                      <Input
                        value={newShift}
                        onChange={(e) => setNewShift(e.target.value)}
                        placeholder="Nome do novo turno"
                      />
                      <Button type="button" size="icon" onClick={handleAddNewShift}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setShowNewShift(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select
                        value={formData.shift}
                        onValueChange={(value) => handleChange('shift', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione o turno" />
                        </SelectTrigger>
                        <SelectContent>
                          {shifts.map((shift) => (
                            <SelectItem key={shift} value={shift}>
                              {shift}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setShowNewShift(true)}
                        title="Incluir novo turno"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => openDeleteDialog('shift')}
                        title="Excluir turno existente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Setor */}
                <div className="space-y-2">
                  <Label htmlFor="sector">Setor *</Label>
                  {showNewSector ? (
                    <div className="flex gap-2">
                      <Input
                        value={newSector}
                        onChange={(e) => setNewSector(e.target.value)}
                        placeholder="Nome do novo setor"
                      />
                      <Button type="button" size="icon" onClick={handleAddNewSector}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setShowNewSector(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select
                        value={formData.sector}
                        onValueChange={(value) => handleChange('sector', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map((sector) => (
                            <SelectItem key={sector} value={sector}>
                              {sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setShowNewSector(true)}
                        title="Adicionar novo setor"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => openDeleteDialog('sector')}
                        title="Excluir setor existente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Operational Data */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Dados Operacionais</h3>

              <div className="space-y-3">
                <Label>Tipo da Vaga *</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                  className="flex flex-wrap gap-4"
                >
                  {VACANCY_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`type-${type}`} />
                      <Label htmlFor={`type-${type}`} className="font-normal cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade de Vagas *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value, 10) || 1)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horário de Trabalho *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Das</span>
                    <Input
                      type="time"
                      value={formData.workHoursStart}
                      onChange={(e) => handleChange('workHoursStart', e.target.value)}
                      className="flex-1"
                      required
                    />
                    <span className="text-sm text-muted-foreground">às</span>
                    <Input
                      type="time"
                      value={formData.workHoursEnd}
                      onChange={(e) => handleChange('workHoursEnd', e.target.value)}
                      className="flex-1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salário Bruto *</Label>
                  <Input
                    id="salary"
                    type="text"
                    value={formatSalaryDisplay(formData.grossSalary || 0)}
                    onChange={handleSalaryChange}
                    placeholder="R$ 0,00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <Label>Status da Vaga *</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
                className="flex flex-wrap gap-4"
              >
                {VACANCY_STATUS.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <RadioGroupItem value={status} id={`status-${status}`} />
                    <Label htmlFor={`status-${status}`} className="font-normal cursor-pointer">
                      {status}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {vacancy ? 'Salvar Alterações' : 'Cadastrar Vaga'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDeleteDialogTitle()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {deleteDialog.items.map((item) => (
              <div key={item} className="flex items-center justify-between p-2 rounded-md border">
                <span className="text-sm">{item}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => {
                    handleDeleteItem(deleteDialog.type, item);
                    const remaining = deleteDialog.items.filter((i) => i !== item);
                    if (remaining.length === 0) {
                      setDeleteDialog((prev) => ({ ...prev, open: false }));
                    } else {
                      setDeleteDialog((prev) => ({ ...prev, items: remaining }));
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {deleteDialog.items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum item disponível.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog((prev) => ({ ...prev, open: false }))}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
