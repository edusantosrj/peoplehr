# PeopleRH - Inventário técnico do backend atual

## 1. Visão geral

O backend atual do PeopleRH é baseado em:
- Frontend React + TypeScript + Vite
- Supabase como backend de dados e storage
- RLS (Row Level Security) ativo nas tabelas e buckets de storage
- RPCs PostgreSQL para entrada pública de candidatos
- Serviços TypeScript para orquestrar leitura/escrita de dados de RH

Este documento descreve a arquitetura atual observada no código-fonte e nas migrations existentes.

---

## 2. Tabelas do Supabase utilizadas

### 2.1 public.candidates
Tabela principal de cadastro de candidatos.

### 2.2 public.hr_evaluations
Dados de avaliação do processo seletivo, estágio atual e status de entrevista.

### 2.3 public.hr_annotations
Anotações internas do RH vinculadas a cada candidato.

### 2.4 public.hr_admissions
Informações de admissão/contratação de candidato e vínculo com vaga.

### 2.5 public.hr_terminations
Informações de desligamento/terminação.

### 2.6 public.hr_documentation
Status e controle de documentos para contratação/encerramento.

### 2.7 public.hr_emergency_contacts
Contatos de emergência por candidato.

### 2.8 public.vacancies
Vagas disponíveis para contratação e controle de quantidade/status.

---

## 3. Campos de cada tabela

### 3.1 public.candidates

| Campo | Tipo | Obrigatório | Observações |
|---|---|---:|---|
| id | uuid | Sim | PK, default gen_random_uuid() |
| cpf | text | Sim | UNIQUE |
| full_name | text | Sim | |
| birth_date | text | Sim | |
| marital_status | text | Sim | |
| mother_name | text | Sim | |
| father_name | text | Não | |
| whatsapp | text | Sim | |
| instagram | text | Não | |
| facebook | text | Não | |
| address | text | Sim | |
| address_number | text | Sim | |
| neighborhood | text | Sim | |
| city | text | Sim | |
| state | text | Sim | |
| education | text | Sim | |
| course | text | Não | |
| period | text | Não | |
| has_technical_course | boolean | Sim | default false |
| completed_courses | text[] | Não | default '{}' |
| other_courses | text | Não | |
| has_criminal_record | boolean | Sim | default false |
| work_experiences | jsonb | Não | default '[]' |
| salary_expectation | text | Sim | |
| immediate_start | boolean | Sim | default false |
| available_weekends | boolean | Sim | default false |
| available_holidays | boolean | Sim | default false |
| desired_position_1 | text | Não | nullable |
| desired_position_2 | text | Não | |
| desired_position_3 | text | Não | |
| resume_url | text | Não | |
| other_files_urls | text[] | Não | |
| lgpd_consent | boolean | Sim | default false |
| lgpd_consent_date | timestamptz | Não | |
| selfie_url | text | Não | adicionado por migration |
| first_job | boolean | Sim | default false |
| nickname | text | Não | adicionado por migration |
| gender | text | Não | adicionado por migration |
| hr_data | jsonb | Não | default null |
| created_at | timestamptz | Sim | default now() |

### 3.2 public.hr_evaluations

| Campo | Tipo | Obrigatório | Observações |
|---|---|---:|---|
| id | uuid | Sim | PK |
| candidate_id | uuid | Sim | FK para candidates, UNIQUE |
| ficha_validation | text | Sim | default 'Em Análise' |
| management_validation | text | Sim | default 'Em Análise' |
| director_validation | text | Sim | default 'Em Análise' |
| proposal_presented | text | Sim | default 'Em Análise' |
| proposal_accepted | text | Sim | default 'Em Análise' |
| documentation_delivered | text | Sim | default 'Em Análise' |
| candidate_hired | text | Sim | default 'Em Análise' |
| talent_bank | boolean | Sim | default false |
| ns | boolean | Sim | default false |
| interview_status | text | Sim | default 'Não' |
| interview_date | text | Não | |
| interview_attended | text | Não | |
| pcd | boolean | Sim | default false |
| current_stage | text | Sim | default 'validation_form' |
| interview_time | text | Não | adicionado por migration |
| interview_observation | text | Não | adicionado por migration |
| created_at | timestamptz | Sim | default now() |
| updated_at | timestamptz | Sim | default now() |

### 3.3 public.hr_annotations

| Campo | Tipo | Obrigatório | Observações |
|---|---|---:|---|
| id | uuid | Sim | PK |
| candidate_id | uuid | Sim | FK para candidates |
| text | text | Sim | |
| created_at | timestamptz | Sim | default now() |

### 3.4 public.hr_admissions

| Campo | Tipo | Obrigatório | Observações |
|---|---|---:|---|
| id | uuid | Sim | PK |
| candidate_id | uuid | Sim | FK para candidates, UNIQUE |
| vacancy_id | text | Não | |
| vacancy_display | text | Não | |
| admission_status | text | Não | |
| defined_salary | text | Não | |
| store_unit | text | Não | |
| work_hours | text | Não | |
| expected_start_date | text | Não | |
| observations | text | Não | |
| created_at | timestamptz | Sim | default now() |
| updated_at | timestamptz | Sim | default now() |

### 3.5 public.hr_terminations

| Campo | Tipo | Obrigatório | Observações |
|---|---|---:|---|
| id | uuid | Sim | PK |
| candidate_id | uuid | Sim | FK para candidates, UNIQUE |
| request_date | text | Não | |
| voluntary_termination | boolean | Não | |
| termination_reason | text | Não | |
| will_serve_notice | boolean | Não | |
| notice_days | integer | Não | |
| last_work_day | text | Não | |
| can_be_rehired | boolean | Não | |
| confirmed | boolean | Não | |
| created_at | timestamptz | Sim | default now() |
| updated_at | timestamptz | Sim | default now() |

### 3.6 public.hr_documentation

| Campo | Tipo | Obrigatório | Observações |
|---|---|---:|---|
| id | uuid | Sim | PK |
| candidate_id | uuid | Sim | FK para candidates, UNIQUE |
| basic_doc_checked | boolean | Sim | default false |
| basic_doc_expiration_date | text | Não | |
| basic_doc_completed | boolean | Não | default false |
| experience_contract_checked | boolean | Sim | default false |
| experience_contract_expiration_date | text | Não | |
| experience_contract_completed | boolean | Não | default false |
| experience_extension_checked | boolean | Sim | default false |
| experience_extension_expiration_date | text | Não | |
| experience_extension_completed | boolean | Não | default false |
| prior_notice_checked | boolean | Sim | default false |
| prior_notice_expiration_date | text | Não | |
| prior_notice_completed | boolean | Não | default false |
| termination_contract_checked | boolean | Sim | default false |
| termination_contract_expiration_date | text | Não | |
| termination_contract_completed | boolean | Não | default false |
| created_at | timestamptz | Sim | default now() |
| updated_at | timestamptz | Sim | default now() |

### 3.7 public.hr_emergency_contacts

| Campo | Tipo | Obrigatório | Observações |
|---|---|---:|---|
| id | uuid | Sim | PK |
| candidate_id | uuid | Sim | FK para candidates |
| name | text | Sim | |
| relationship | text | Sim | |
| phone | text | Sim | |
| created_at | timestamptz | Sim | default now() |

### 3.8 public.vacancies

| Campo | Tipo | Obrigatório | Observações |
|---|---|---:|---|
| id | uuid | Sim | PK |
| name | text | Sim | |
| unit | text | Sim | |
| shift | text | Sim | |
| sector | text | Sim | |
| type | text | Sim | |
| quantity | integer | Sim | default 0 |
| work_hours_start | text | Sim | |
| work_hours_end | text | Sim | |
| gross_salary | numeric | Sim | default 0 |
| status | text | Sim | default 'Ativa' |
| observation | text | Não | |
| mission | text | Não | |
| responsibilities | text | Não | |
| expectations | text | Não | |
| offerings | text | Não | |
| created_at | timestamptz | Sim | default now() |
| updated_at | timestamptz | Sim | default now() |

---

## 4. Tipos de dados observados

### 4.1 Tipos SQL usados
- uuid
- text
- boolean
- integer
- numeric
- jsonb
- timestamp with time zone
- text[]

### 4.2 Tipos TypeScript correspondentes
- string
- boolean
- number
- Json
- arrays de string
- interfaces e tipos mapeados em src/types

---

## 5. Relacionamentos

### 5.1 candidates -> hr_* tables
- Uma candidate pode ter:
  - 0 ou 1 registro em hr_evaluations
  - 0 ou N registros em hr_annotations
  - 0 ou 1 registro em hr_admissions
  - 0 ou 1 registro em hr_terminations
  - 0 ou 1 registro em hr_documentation
  - 0 ou N registros em hr_emergency_contacts

### 5.2 hr_admissions -> vacancies
- O campo vacancy_id em hr_admissions armazena um identificador de vaga, mas não há FK declarada para vacancies no schema atual.
- A lógica de dependência é feita no frontend via consulta a hr_admissions usando vacancy_id.

### 5.3 Relações implícitas no código
- A aplicação acompanha dados de RH por candidate_id e utiliza joins lógicos no frontend.

---

## 6. Chaves primárias

| Tabela | PK |
|---|---|
| public.candidates | id |
| public.hr_evaluations | id |
| public.hr_annotations | id |
| public.hr_admissions | id |
| public.hr_terminations | id |
| public.hr_documentation | id |
| public.hr_emergency_contacts | id |
| public.vacancies | id |

---

## 7. Chaves estrangeiras

| Tabela | FK | Referência | Cardinalidade |
|---|---|---|---|
| public.hr_evaluations.candidate_id | hr_evaluations_candidate_id_fkey | public.candidates.id | 1:1 |
| public.hr_annotations.candidate_id | hr_annotations_candidate_id_fkey | public.candidates.id | 1:N |
| public.hr_admissions.candidate_id | hr_admissions_candidate_id_fkey | public.candidates.id | 1:1 |
| public.hr_terminations.candidate_id | hr_terminations_candidate_id_fkey | public.candidates.id | 1:1 |
| public.hr_documentation.candidate_id | hr_documentation_candidate_id_fkey | public.candidates.id | 1:1 |
| public.hr_emergency_contacts.candidate_id | hr_emergency_contacts_candidate_id_fkey | public.candidates.id | 1:N |

Observação: não há FK declarada de hr_admissions.vacancy_id para vacancies.

---

## 8. Índices

### Índices explícitos
- Não há migrations com CREATE INDEX ou CREATE UNIQUE INDEX.

### Restrições de unicidade presentes
- public.candidates.cpf é UNIQUE.
- public.hr_evaluations.candidate_id é UNIQUE.
- public.hr_admissions.candidate_id é UNIQUE.
- public.hr_terminations.candidate_id é UNIQUE.
- public.hr_documentation.candidate_id é UNIQUE.

---

## 9. Views

- Nenhuma view foi criada nas migrations atuais.
- O arquivo de tipos do Supabase declara Views como vazio.

---

## 10. Buckets do Storage

### 10.1 selfies
- Criado em migration 20260414192346.
- Bucket público em configuração inicial, mas o fluxo atual usa paths privados e signed URLs no frontend.
- Usado para foto do candidato.

### 10.2 documents
- Criado em migration 20260507161156.
- Usado para currículo e anexos diversos.

---

## 11. Políticas RLS

### 11.1 Tabelas SQL

#### public.candidates
- INSERT: qualquer pessoa pode inserir (formulário público).
- SELECT: somente usuários autenticados podem consultar.
- O policy de anon CPF-existence foi removido em migration posterior.

#### public.hr_evaluations
- SELECT/INSERT/UPDATE: autenticados.

#### public.hr_annotations
- SELECT/INSERT/UPDATE: autenticados.

#### public.hr_admissions
- SELECT/INSERT/UPDATE: autenticados.

#### public.hr_terminations
- SELECT/INSERT/UPDATE: autenticados.

#### public.hr_documentation
- SELECT/INSERT/UPDATE: autenticados.

#### public.hr_emergency_contacts
- SELECT/INSERT/UPDATE: autenticados.
- DELETE: autenticados.

#### public.vacancies
- SELECT: autenticados por padrão.
- INSERT/UPDATE: autenticados.
- Há uma policy adicional para anon em 20260611172107 permitindo SELECT somente para vagas com status 'Ativa'.

### 11.2 Storage

#### selfies
- INSERT: público para upload.
- SELECT: autenticados após a migration de 20260714204521.
- DELETE: autenticados.

#### documents
- SELECT: autenticados.
- INSERT: público para upload.
- DELETE: autenticados.

---

## 12. Funções SQL

### 12.1 public.candidate_cpf_exists(p_cpf text)
- Retorna boolean.
- Usada pelo fluxo público para verificar se um CPF já existe.
- Exposta para anon e authenticated.
- Implementada em migration 20260602155657.

### 12.2 public.submit_candidate_application(p_payload jsonb)
- RPC de inserção/atualização de candidatura a partir do formulário público.
- Usa o CPF como chave de upsert lógica.
- Atualiza os campos do candidato e preserva URLs já existentes quando não recebidas.
- Exposta para anon e authenticated.

---

## 13. RPCs

| RPC | Uso no frontend | Observações |
|---|---|---|
| candidate_cpf_exists | CpfPreCheck.tsx | Verifica existência do CPF |
| submit_candidate_application | Index.tsx | Envia o payload do formulário público |

---

## 14. Triggers

- Nenhum trigger implementado nas migrations atuais.
- Não há evidência de triggers em código adicional.

---

## 15. Migrations existentes

| Migration | Resumo |
|---|---|
| 20260406124623_... | Cria public.candidates e políticas para inserção/consulta |
| 20260406124738_... | Ajusta política de CPF existence |
| 20260407121554_... | Adiciona coluna hr_data em candidates |
| 20260408144708_... | Cria tabelas hr_evaluations, hr_annotations, hr_admissions, hr_terminations, hr_documentation, hr_emergency_contacts e políticas RLS |
| 20260413114417_... | Cria public.vacancies e políticas |
| 20260414192346_... | Adiciona selfie_url e cria bucket selfies |
| 20260414211454_... | Adiciona coluna first_job |
| 20260507161156_... | Cria bucket documents |
| 20260513030530_... | Adiciona coluna pcd em hr_evaluations |
| 20260526124419_... | Adiciona nickname e gender em candidates |
| 20260602155657_... | Cria funções SQL candidate_cpf_exists e submit_candidate_application |
| 20260603121354_... | Adiciona colunas de observação/descritivas em vacancies |
| 20260605204942_... | Adiciona policies de delete para storage |
| 20260610161726_... | Torna desired_position_1 nullable |
| 20260611172107_... | Ajusta acesso anon a vacancies ativas |
| 20260714204521_... | Ajusta políticas de leitura de storage |
| 20260720125305_... | Adiciona current_stage e ajusta defaults em hr_evaluations |
| 20260727180000_... | Adiciona interview_time e interview_observation |

---

## 16. Arquivos TypeScript relacionados ao banco

### 16.1 Cliente Supabase
- src/integrations/supabase/client.ts
  - Cria o cliente Supabase com tipagem Database.

### 16.2 Tipos gerados
- src/integrations/supabase/types.ts
  - Define os tipos Database, Tables, Inserts, Updates e funções RPC.

### 16.3 Tipos de domínio
- src/types/candidate.ts
- src/types/hr.ts
- src/types/vacancy.ts

### 16.4 Serviços de persistência
- src/services/hrDataService.ts

### 16.5 Storage helpers
- src/lib/storagePath.ts

### 16.6 Contexto de vagas
- src/contexts/VacancyContext.tsx

### 16.7 Páginas e componentes que usam o backend
- src/pages/Index.tsx
- src/pages/HRDashboard.tsx
- src/components/candidate/CpfPreCheck.tsx
- src/components/hr/CandidateEditDialog.tsx
- src/components/hr/CandidateProfile.tsx
- src/components/hr/CandidateList.tsx
- src/components/hr/SelectionKanban.tsx
- src/components/hr/reports/FunnelReport.tsx
- src/components/vacancy/VacancyForm.tsx
- src/components/vacancy/VacancyList.tsx
- src/components/vacancy/VacancyMap.tsx

---

## 17. Serviços responsáveis pela persistência

### 17.1 src/services/hrDataService.ts
Este é o principal serviço de persistência de dados de RH.

Funções:
- normalizeInterviewStatus
- fetchAllHRData(candidateIds)
- saveEvaluation(candidateId, evaluation)
- addAnnotation(candidateId, text)
- saveAdmission(candidateId, admission)
- saveTermination(candidateId, termination)
- saveDocumentation(candidateId, doc)
- saveEmergencyContacts(candidateId, contacts)

Operações realizadas:
- Leitura em lote das tabelas hr_evaluations, hr_annotations, hr_admissions, hr_terminations, hr_documentation e hr_emergency_contacts.
- Upsert/insert/delete individual por tabela.
- Mapeamento do formato banco para o formato de UI.

### 17.2 Contexto de vagas
- src/contexts/VacancyContext.tsx
- Responsável por CRUD de vacancies.
- Também realiza débito/crédito de quantidade em vagas e verificação de dependências via hr_admissions.

### 17.3 Fluxo de storage
- src/lib/storagePath.ts
- Gera signed URLs para arquivos armazenados em buckets privados.

---

## 18. Hooks relacionados ao banco

### 18.1 useSignedStorageUrl
Local: src/lib/storagePath.ts
- Hook React para criar URL assinada de um arquivo armazenado em storage.

### 18.2 useSignedStorageUrls
Local: src/lib/storagePath.ts
- Hook para múltiplos arquivos.

### 18.3 useVacancies
Local: src/contexts/VacancyContext.tsx
- Hook customizado que encapsula leitura e manipulação de vacancies.

### 18.4 Observação
- Não existe um hook dedicado para ler/escrever candidates ou hr_* tables; essa lógica é centralizada em serviços e componentes.

---

## 19. Fluxo completo de leitura e gravação

### 19.1 Fluxo público de cadastro de candidato
1. O usuário entra com CPF na tela de pré-check.
2. O frontend chama a RPC candidate_cpf_exists.
3. Se o CPF não existir, o formulário é exibido.
4. Ao submeter o formulário:
   - arquivos são enviados para os buckets selfies/documents;
   - os paths são armazenados em campos do payload;
   - o payload é enviado pela RPC submit_candidate_application;
   - a função SQL faz insert ou update da tabela candidates com base no CPF.

### 19.2 Fluxo de leitura do painel RH
1. O painel HRDashboard carrega todos os candidatos de public.candidates.
2. Em seguida, chama fetchAllHRData para buscar os dados relacionados de:
   - hr_evaluations
   - hr_annotations
   - hr_admissions
   - hr_terminations
   - hr_documentation
   - hr_emergency_contacts
3. O resultado é mapeado para o formato de UI e exibido em listas, perfis e kanban.

### 19.3 Fluxo de gravação de dados de RH
1. Ao editar avaliação, o componente chama saveEvaluation.
2. Ao adicionar anotação, chama addAnnotation.
3. Ao salvar admissão, chama saveAdmission.
4. Ao salvar desligamento, chama saveTermination.
5. Ao salvar documentação, chama saveDocumentation.
6. Ao salvar contatos de emergência, chama saveEmergencyContacts.

### 19.4 Fluxo de vagas
1. O VacancyContext lê public.vacancies.
2. O contexto permite criar, atualizar e excluir vagas.
3. Quando uma admissão muda para Contratado, o sistema debita a quantidade da vaga.
4. Quando um desligamento é confirmado, a quantidade é creditada de volta.

### 19.5 Fluxo de storage
1. Arquivos são enviados para os buckets storage.
2. O frontend armazena o path do objeto no banco.
3. O helper src/lib/storagePath.ts gera signed URLs para visualização segura.

---

## 20. Dependências entre módulos

### 20.1 Dependência principal
- src/pages/HRDashboard.tsx depende de src/services/hrDataService.ts para carregar dados de RH.

### 20.2 Dependência de contexto de vagas
- src/components/hr/CandidateProfile.tsx depende de useVacancies para debitar/creditar vagas.
- src/pages/HRDashboard.tsx usa VacancyProvider para oferecer vagas para o painel.

### 20.3 Dependência de storage
- src/pages/Index.tsx e src/components/hr/CandidateEditDialog.tsx usam Supabase storage diretamente.
- src/lib/storagePath.ts centraliza a geração de URLs assinadas.

### 20.4 Dependência de tipos
- Components e services dependem de src/types/candidate.ts, src/types/hr.ts e src/types/vacancy.ts.

---

## 21. Componentes que utilizam cada tabela

| Tabela | Componentes / módulos principais |
|---|---|
| public.candidates | HRDashboard.tsx, CandidateList.tsx, CandidateProfile.tsx, CandidateEditDialog.tsx, Index.tsx, CpfPreCheck.tsx |
| public.hr_evaluations | CandidateProfile.tsx, SelectionKanban.tsx, FunnelReport.tsx, hrDataService.ts |
| public.hr_annotations | CandidateProfile.tsx, AnnotationsBlock, hrDataService.ts |
| public.hr_admissions | CandidateProfile.tsx, AdmissionBlock, VacancyContext.tsx |
| public.hr_terminations | CandidateProfile.tsx, TerminationBlock, hrDataService.ts |
| public.hr_documentation | CandidateProfile.tsx, DocumentationBlock, hrDataService.ts |
| public.hr_emergency_contacts | CandidateProfile.tsx, EmergencyContactsBlock, hrDataService.ts |
| public.vacancies | VacancyProvider, VacancyModule, VacancyForm.tsx, VacancyList.tsx, VacancyMap.tsx, CandidateProfile.tsx |

---

## 22. Resumo arquitetural

O backend atual do PeopleRH é uma arquitetura simples e pragmática baseada em:
- uma tabela principal de candidatos;
- uma coleção de tabelas auxiliares para dados de RH;
- uma tabela de vagas com regras de quantidade e status;
- storage para arquivos e selfies;
- RPCs públicas para cadastro anonimo;
- RLS para controlar acesso;
- e serviços TypeScript para centralizar operações de persistência.

O design atual prioriza simplicidade e compatibilidade com a operação do RH, mas ainda depende em parte do frontend para regras de negócio complexas que não estão totalmente encapsuladas no banco.
