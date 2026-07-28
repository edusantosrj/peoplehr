# PeopleRH - Arquitetura backend complementar

## 1. Fluxo completo de cada CRUD

Este capítulo descreve, para cada operação principal, a cadeia de execução observada no projeto:

Tela/Componente → Hook/Contexto → Service → Supabase → Tabela

### 1.1 CRUD de candidatos

#### Leitura de candidatos
- Componente: [src/pages/HRDashboard.tsx](src/pages/HRDashboard.tsx)
- Hook: nenhum hook customizado; uso direto de estado local
- Service: nenhum; leitura direta no componente
- Supabase: client do Supabase
- Tabela: public.candidates
- Operação: select * from public.candidates order by created_at desc

#### Escrita de candidatos (edição de ficha)
- Componente: [src/components/hr/CandidateEditDialog.tsx](src/components/hr/CandidateEditDialog.tsx)
- Hook: nenhum hook customizado
- Service: nenhum
- Supabase: client do Supabase
- Tabela: public.candidates
- Operação: update em public.candidates por id
- Observação: também faz upload de foto para storage.selfies antes do update

#### Cadastro público de candidato
- Componente: [src/pages/Index.tsx](src/pages/Index.tsx)
- Hook: nenhum
- Service: nenhum
- Supabase: rpc submit_candidate_application
- Tabela: public.candidates
- Operação: insert/update via função SQL

#### Verificação de CPF
- Componente: [src/components/candidate/CpfPreCheck.tsx](src/components/candidate/CpfPreCheck.tsx)
- Hook: nenhum
- Service: nenhum
- Supabase: rpc candidate_cpf_exists
- Tabela: public.candidates
- Operação: select boolean via função SQL

---

### 1.2 CRUD de avaliações de RH

#### Leitura em lote
- Componente: [src/pages/HRDashboard.tsx](src/pages/HRDashboard.tsx)
- Hook: nenhum
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: client do Supabase
- Tabela: public.hr_evaluations
- Operação: select por candidate_id em lote

#### Salvamento/atualização
- Componente: [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
- Hook: nenhum
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: client do Supabase
- Tabela: public.hr_evaluations
- Operação: upsert com onConflict candidate_id

#### Consumo em Kanban / relatórios
- Componente: [src/components/hr/SelectionKanban.tsx](src/components/hr/SelectionKanban.tsx) e [src/components/hr/reports/FunnelReport.tsx](src/components/hr/reports/FunnelReport.tsx)
- Hook: nenhum
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: consulta indireta via dados já carregados em memória
- Tabela: public.hr_evaluations

---

### 1.3 CRUD de anotações

#### Criação
- Componente: [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
- Hook: nenhum
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: client do Supabase
- Tabela: public.hr_annotations
- Operação: insert + select single

#### Leitura
- Componente: [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
- Hook: nenhum
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: client do Supabase
- Tabela: public.hr_annotations
- Operação: select por candidate_id order by created_at

---

### 1.4 CRUD de admissões

#### Leitura
- Componente: [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
- Hook: nenhum
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: client do Supabase
- Tabela: public.hr_admissions
- Operação: select por candidate_id

#### Salvamento/atualização
- Componente: [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
- Hook: [src/contexts/VacancyContext.tsx](src/contexts/VacancyContext.tsx) para debitar vaga
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: client do Supabase
- Tabela: public.hr_admissions
- Operação: upsert com onConflict candidate_id

#### Efeito colateral de vaga
- Componente: [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
- Hook: useVacancies
- Service: [src/contexts/VacancyContext.tsx](src/contexts/VacancyContext.tsx)
- Supabase: update em public.vacancies
- Tabela: public.vacancies

---

### 1.5 CRUD de desligamentos

#### Leitura
- Componente: [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
- Hook: nenhum
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: client do Supabase
- Tabela: public.hr_terminations
- Operação: select por candidate_id

#### Salvamento/atualização
- Componente: [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
- Hook: useVacancies
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: client do Supabase
- Tabela: public.hr_terminations
- Operação: upsert com onConflict candidate_id

#### Efeito colateral de vaga
- Ao confirmar desligamento, o contexto de vagas credita a vaga de volta
- Tabela: public.vacancies

---

### 1.6 CRUD de documentação

#### Leitura
- Componente: [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
- Hook: nenhum
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: client do Supabase
- Tabela: public.hr_documentation
- Operação: select por candidate_id

#### Salvamento/atualização
- Componente: [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
- Hook: nenhum
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: client do Supabase
- Tabela: public.hr_documentation
- Operação: upsert com onConflict candidate_id

---

### 1.7 CRUD de contatos de emergência

#### Leitura
- Componente: [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
- Hook: nenhum
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: client do Supabase
- Tabela: public.hr_emergency_contacts
- Operação: select por candidate_id order by created_at

#### Salvamento/atualização
- Componente: [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
- Hook: nenhum
- Service: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Supabase: client do Supabase
- Tabela: public.hr_emergency_contacts
- Operação: delete existing + insert rows

---

### 1.8 CRUD de vagas

#### Leitura
- Componente: [src/components/vacancy/VacancyList.tsx](src/components/vacancy/VacancyList.tsx), [src/components/vacancy/VacancyMap.tsx](src/components/vacancy/VacancyMap.tsx), [src/components/hr/StaffDashboard.tsx](src/components/hr/StaffDashboard.tsx)
- Hook: useVacancies
- Service: [src/contexts/VacancyContext.tsx](src/contexts/VacancyContext.tsx)
- Supabase: client do Supabase
- Tabela: public.vacancies
- Operação: select com filtro de sessão e colunas públicas

#### Criação
- Componente: [src/components/vacancy/VacancyForm.tsx](src/components/vacancy/VacancyForm.tsx)
- Hook: useVacancies
- Service: [src/contexts/VacancyContext.tsx](src/contexts/VacancyContext.tsx)
- Supabase: insert em public.vacancies

#### Atualização
- Componente: [src/components/vacancy/VacancyForm.tsx](src/components/vacancy/VacancyForm.tsx)
- Hook: useVacancies
- Service: [src/contexts/VacancyContext.tsx](src/contexts/VacancyContext.tsx)
- Supabase: update em public.vacancies

#### Exclusão
- Componente: [src/components/vacancy/VacancyList.tsx](src/components/vacancy/VacancyList.tsx)
- Hook: useVacancies
- Service: [src/contexts/VacancyContext.tsx](src/contexts/VacancyContext.tsx)
- Supabase: delete em public.vacancies
- Verificação: consulta em public.hr_admissions para validar dependências

---

## 2. Context Providers existentes

### 2.1 VacancyProvider
- Arquivo: [src/contexts/VacancyContext.tsx](src/contexts/VacancyContext.tsx)
- Responsabilidade: centralizar o estado e operações de vagas, incluindo CRUD, status, quantidade, filtros e regras de dependência.
- Componentes consumidores:
  - [src/pages/HRDashboard.tsx](src/pages/HRDashboard.tsx)
  - [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
  - [src/components/hr/blocks/AdmissionBlock.tsx](src/components/hr/blocks/AdmissionBlock.tsx)
  - [src/components/hr/reports/DocumentsControlPanel.tsx](src/components/hr/reports/DocumentsControlPanel.tsx)
  - [src/components/hr/reports/ReportsModule.tsx](src/components/hr/reports/ReportsModule.tsx)
  - [src/components/hr/SelectionKanban.tsx](src/components/hr/SelectionKanban.tsx)
  - [src/components/hr/StaffDashboard.tsx](src/components/hr/StaffDashboard.tsx)
  - [src/components/vacancy/VacancyForm.tsx](src/components/vacancy/VacancyForm.tsx)
  - [src/components/vacancy/VacancyList.tsx](src/components/vacancy/VacancyList.tsx)
  - [src/components/vacancy/VacancyMap.tsx](src/components/vacancy/VacancyMap.tsx)
- Operações executadas:
  - carregar vagas
  - criar/editar/excluir vaga
  - debitar/creditar quantidade
  - validar dependências via hr_admissions
  - gerenciar setores/lojas/turnos visíveis

---

## 3. Hooks personalizados

### 3.1 useVacancies
- Arquivo: [src/contexts/VacancyContext.tsx](src/contexts/VacancyContext.tsx)
- Onde é usado: diversos componentes de vagas e RH
- O que retorna: vagas, setores, unidades, turnos, loading, funções de CRUD, débito/crédito, refresh
- Tabelas acessadas: public.vacancies, public.hr_admissions

### 3.2 useSignedStorageUrl
- Arquivo: [src/lib/storagePath.ts](src/lib/storagePath.ts)
- Onde é usado: [src/components/hr/SignedAvatarImage.tsx](src/components/hr/SignedAvatarImage.tsx), [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx), [src/components/hr/CandidateCardDialog.tsx](src/components/hr/CandidateCardDialog.tsx)
- O que retorna: URL assinada para um item de storage
- Tabelas acessadas: não acessa tabela SQL; acessa storage do Supabase via bucket

### 3.3 useSignedStorageUrls
- Arquivo: [src/lib/storagePath.ts](src/lib/storagePath.ts)
- Onde é usado: em componentes de múltiplos arquivos, quando necessário
- O que retorna: array de URLs assinadas para múltiplos valores de storage
- Tabelas acessadas: não acessa tabela SQL; acessa storage do Supabase

### 3.4 use-mobile (UI helper)
- Arquivo: [src/hooks/use-mobile.tsx](src/hooks/use-mobile.tsx)
- Onde é usado: componentes de UI responsiva
- O que retorna: booleano indicando viewport móvel
- Tabelas acessadas: nenhuma

### 3.5 use-toast (UI helper)
- Arquivo: [src/hooks/use-toast.ts](src/hooks/use-toast.ts)
- Onde é usado: toda a aplicação para feedback visual
- O que retorna: helper para toasts
- Tabelas acessadas: nenhuma

---

## 4. Serviços

### 4.1 hrDataService
- Arquivo: [src/services/hrDataService.ts](src/services/hrDataService.ts)
- Responsabilidade: consolidar leituras e gravações das tabelas de RH em um único ponto.
- Funções disponíveis:
  - normalizeInterviewStatus(status)
  - fetchAllHRData(candidateIds)
  - saveEvaluation(candidateId, evaluation)
  - addAnnotation(candidateId, text)
  - saveAdmission(candidateId, admission)
  - saveTermination(candidateId, termination)
  - saveDocumentation(candidateId, doc)
  - saveEmergencyContacts(candidateId, contacts)
- Tabelas utilizadas:
  - public.hr_evaluations
  - public.hr_annotations
  - public.hr_admissions
  - public.hr_terminations
  - public.hr_documentation
  - public.hr_emergency_contacts
- Componentes consumidores:
  - [src/pages/HRDashboard.tsx](src/pages/HRDashboard.tsx)
  - [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)
  - [src/components/hr/SelectionKanban.tsx](src/components/hr/SelectionKanban.tsx)
  - [src/components/hr/reports/FunnelReport.tsx](src/components/hr/reports/FunnelReport.tsx)

### 4.2 VacancyContext (não é um service tradicional, mas atua como camada de persistência para vagas)
- Arquivo: [src/contexts/VacancyContext.tsx](src/contexts/VacancyContext.tsx)
- Funções disponíveis:
  - addVacancy
  - updateVacancy
  - deleteVacancy
  - checkVacancyDependencies
  - debitVacancy
  - creditVacancy
  - refreshVacancies
- Tabelas utilizadas:
  - public.vacancies
  - public.hr_admissions
- Componentes consumidores:
  - flow de vagas e painel RH

---

## 5. Fluxos de upload de arquivos

### 5.1 Upload de selfie no cadastro público
- Origem: formulário público de candidatura
- Bucket: selfies
- Função utilizada: supabase.storage.from("selfies").upload(...)
- Persistência no banco: o path do arquivo é salvo em public.candidates.selfie_url via RPC submit_candidate_application
- Componentes envolvidos:
  - [src/pages/Index.tsx](src/pages/Index.tsx)
  - [src/components/candidate/CandidateForm.tsx](src/components/candidate/CandidateForm.tsx)

### 5.2 Upload de selfie na edição do RH
- Origem: edição da ficha do candidato no painel RH
- Bucket: selfies
- Função utilizada: supabase.storage.from("selfies").upload(...)
- Persistência no banco: o path é salvo em public.candidates.selfie_url via update em candidates
- Componentes envolvidos:
  - [src/components/hr/CandidateEditDialog.tsx](src/components/hr/CandidateEditDialog.tsx)

### 5.3 Upload de currículo e anexos
- Origem: formulário público de candidatura
- Bucket: documents
- Função utilizada: supabase.storage.from("documents").upload(...)
- Persistência no banco: os paths são enviados na RPC submit_candidate_application e salvos em public.candidates.resume_url e other_files_urls
- Componentes envolvidos:
  - [src/pages/Index.tsx](src/pages/Index.tsx)
  - [src/components/candidate/CandidateForm.tsx](src/components/candidate/CandidateForm.tsx)

### 5.4 Leitura de arquivos via URL assinada
- Origem: exibição de foto/currículo/anexos no frontend
- Bucket: selfies ou documents
- Função utilizada: supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
- Persistência no banco: nenhuma; a referência é lida a partir dos campos do candidato
- Componentes envolvidos:
  - [src/lib/storagePath.ts](src/lib/storagePath.ts)
  - [src/components/hr/SignedAvatarImage.tsx](src/components/hr/SignedAvatarImage.tsx)
  - [src/components/hr/CandidateCardDialog.tsx](src/components/hr/CandidateCardDialog.tsx)
  - [src/components/hr/CandidateProfile.tsx](src/components/hr/CandidateProfile.tsx)

---

## 6. Diagrama textual da arquitetura

Tela/Fluxo
↓
Componente React
↓
Hook/Contexto (quando aplicável)
↓
Service ou camada de persistência
↓
Supabase Client
↓
Tabela/Storage/Bucket/RPC

Exemplos:

Cadastro público
- Tela de candidatura
↓
[src/pages/Index.tsx](src/pages/Index.tsx)
↓
Nenhum hook customizado
↓
Nenhum service
↓
Supabase Client
↓
RPC submit_candidate_application
↓
public.candidates + storage buckets

Painel RH
- [src/pages/HRDashboard.tsx](src/pages/HRDashboard.tsx)
↓
[src/services/hrDataService.ts](src/services/hrDataService.ts)
↓
Supabase Client
↓
public.candidates + public.hr_* tables

Vagas
- [src/components/vacancy/VacancyForm.tsx](src/components/vacancy/VacancyForm.tsx)
↓
useVacancies
↓
[src/contexts/VacancyContext.tsx](src/contexts/VacancyContext.tsx)
↓
Supabase Client
↓
public.vacancies + public.hr_admissions

Arquivos
- [src/components/hr/CandidateEditDialog.tsx](src/components/hr/CandidateEditDialog.tsx)
↓
Supabase Storage
↓
Bucket selfies
↓
public.candidates.selfie_url

---

## 7. Diagrama textual completo do banco de dados

### 7.1 Visão geral

public.candidates
├── 0..1 public.hr_evaluations
├── 0..N public.hr_annotations
├── 0..1 public.hr_admissions
├── 0..1 public.hr_terminations
├── 0..1 public.hr_documentation
└── 0..N public.hr_emergency_contacts

public.hr_admissions
└── (referência textual a vaga via vacancy_id, sem FK declarada)

public.vacancies
└── usada para controle de quantidade/status e referência por admissão

### 7.2 Relacionamentos detalhados

- candidates.id 1 --- 0..1 hr_evaluations.candidate_id
- candidates.id 1 --- 0..N hr_annotations.candidate_id
- candidates.id 1 --- 0..1 hr_admissions.candidate_id
- candidates.id 1 --- 0..1 hr_terminations.candidate_id
- candidates.id 1 --- 0..1 hr_documentation.candidate_id
- candidates.id 1 --- 0..N hr_emergency_contacts.candidate_id
- hr_admissions.vacancy_id -> referência textual a uma vaga (não há FK declarada)

### 7.3 Estrutura conceitual

public.candidates
- dados pessoais e profissionais do candidato

public.hr_evaluations
- estágio do processo seletivo e avaliação do RH

public.hr_annotations
- notas e observações internas

public.hr_admissions
- dados de contratação e vínculo com vaga

public.hr_terminations
- dados de desligamento

public.hr_documentation
- controle de documentos obrigatórios

public.hr_emergency_contacts
- contatos de emergência

public.vacancies
- gestão de vagas de seleção/contratação

---

## 8. Resumo arquitetural final

A arquitetura atual do backend do PeopleRH é uma camada simples baseada em Supabase, com:
- leitura e escrita diretas por componentes e serviços;
- um provider central para vagas;
- hooks pequenos para leitura de storage e acesso a estado de vagas;
- serviços específicos para consolidar dados de RH;
- use de RPCs para entrada pública de candidatos;
- storage dedicado para selfies e documentos;
- e um modelo relacional pequeno, porém suficiente para o fluxo ATS atual.
