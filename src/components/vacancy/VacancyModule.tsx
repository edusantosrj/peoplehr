import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VacancyList } from './VacancyList';
import { VacancyForm } from './VacancyForm';
import { VacancyMap } from './VacancyMap';
import type { Vacancy } from '@/types/vacancy';
import { List, Map, Plus } from 'lucide-react';

type ViewMode = 'list' | 'map' | 'form';

export const VacancyModule = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | undefined>();

  const handleNewVacancy = () => {
    setEditingVacancy(undefined);
    setViewMode('form');
  };

  const handleEditVacancy = (vacancy: Vacancy) => {
    setEditingVacancy(vacancy);
    setViewMode('form');
  };

  const handleSaveVacancy = () => {
    setEditingVacancy(undefined);
    setViewMode('list');
  };

  const handleCancelForm = () => {
    setEditingVacancy(undefined);
    setViewMode('list');
  };

  if (viewMode === 'form') {
    return (
      <VacancyForm
        vacancy={editingVacancy}
        onSave={handleSaveVacancy}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          Lista de Vagas
        </TabsTrigger>
        <TabsTrigger value="map" className="flex items-center gap-2">
          <Map className="h-4 w-4" />
          Mapa Estratégico
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list">
        <VacancyList onEdit={handleEditVacancy} onNew={handleNewVacancy} />
      </TabsContent>

      <TabsContent value="map" forceMount className={viewMode !== 'map' ? 'hidden' : ''}>
        <VacancyMap />
      </TabsContent>
    </Tabs>
  );
};
