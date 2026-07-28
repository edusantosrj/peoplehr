# 03. Schema do Banco de Dados do PeopleRH

Este documento consolida a documentação técnica oficial do modelo de dados do PeopleRH com base nas migrations existentes, no código TypeScript e nas políticas de segurança observadas no projeto.

## 1. Visão Geral

### Objetivo do banco

O banco de dados do PeopleRH tem como objetivo persistir o ciclo completo de contratação e RH para candidatos, vagas, avaliações, documentação, admissões, desligamentos e contatos de emergência. Ele suporta tanto o fluxo público de candidatura quanto o painel interno de RH.

### Filosofia da modelagem

A modelagem atual privilegia:

- simplicidade operacional sobre normalização extrema;
- armazenamento de dados transacionais em tabelas principais e auxiliares;
- uso de uma tabela central de candidatos para unificar o histórico do processo;
- preservação de compatibilidade com dados legados e com o fluxo atual do frontend;
- uso de storage externo para arquivos, mantendo no banco apenas referências.

### Visão geral das entidades

O schema atual é composto por:

- Candidates: entidade central do processo seletivo;
- Vacancies: cadastro de vagas e controle de disponibilidade;
- HR Evaluations: estado do processo de avaliação e estágio atual;
- Documentation: controle de documentos por candidato;
- Admissions: registro de contratação/admissão vinculada a uma vaga;
- Terminations: registro de desligamento/encerramento;
- Emergency Contacts: contatos de emergência associados ao candidato;
- HR Annotations: anotações internas do RH.

O banco também conta com buckets de storage para arquivos de candidatura e buckets de documentos.

---

## 2. Modelo Conceitual

### Candidates

Representa a pessoa candidata ao processo seletivo. É a entidade principal do modelo e concentra dados pessoais, profissionais, de contato, de intenção de candidatura e de consentimento LGPD.

Responsabilidades:

- armazenar o cadastro base do candidato;
- servir como referência para todos os módulos de RH;
- guardar links para arquivos em storage;
- preservar histórico de candidatura e dados de atualização.

### Vacancies

Representa as vagas disponíveis para contratação. Ela funciona como catálogo de posições, unidades, setores e turnos.

Responsabilidades:

- registrar posições abertas;
- controlar quantidade disponível;
- permitir filtro por unidade, setor e turno;
- atuar como referência para admissões, embora o relacionamento atual seja implícito.

### HR Evaluations

Representa a avaliação interna do candidato durante o processo seletivo.

Responsabilidades:

- acompanhar estágio atual do fluxo;
- registrar validações de ficha, gestão, diretoria e proposta;
- controlar status de entrevista;
- indicar se o candidato está em banco de talentos, PCD, NS ou contratado.

### Documentation

Representa o controle documental do candidato, com um conjunto de itens de documentos ligados ao processo de contratação ou desligamento.

Responsabilidades:

- registrar a checagem de cada tipo documental;
- manter datas de vencimento;
- controlar se cada documento foi concluído;
- fornecer uma visão operacional do status documental do candidato.

### Admissions

Representa a admissão/contratação do candidato e o vínculo com uma vaga.

Responsabilidades:

- registrar a aceitação da vaga;
- armazenar informações de salário, unidade, jornada e início esperado;
- manter o vínculo com a vaga por meio de identificador textual e/ou exibição traduzida.

### Terminations

Representa o desligamento/terminação do candidato.

Responsabilidades:

- registrar pedido de desligamento;
- armazenar motivo, aviso prévio e data de encerramento;
- indicar se pode ser recontratado.

### Emergency Contacts

Representa os contatos de emergência associados a cada candidato.

Responsabilidades:

- armazenar dados de contato de terceiros;
- permitir relacionamento 1:N com candidatos;
- servir como apoio operacional para contingências.

### HR Annotations

Representa anotações internas do RH.

Responsabilidades:

- registrar observações abertas sobre o candidato;
- manter histórico cronológico de comentários internos;
- apoiar a tomada de decisão sem duplicar dados transacionais em outras tabelas.

---

## 3. Modelo Lógico

O modelo lógico atual é um modelo relacional simples com uma entidade central e múltiplas tabelas complementares.

```text
Candidates
    │
    ├── 1:1 HR Evaluations
    ├── 1:1 Documentation
    ├── 1:1 Admissions
    ├── 1:1 Terminations
    ├── 1:N Emergency Contacts
    └── 1:N HR Annotations

Vacancies
    └── (relacionamento implícito com Admissions via vacancy_id)
```

### Relacionamentos observados

- Candidates -> HR Evaluations: 1:1
- Candidates -> Documentation: 1:1
- Candidates -> Admissions: 1:1
- Candidates -> Terminations: 1:1
- Candidates -> Emergency Contacts: 1:N
- Candidates -> HR Annotations: 1:N
- Admissions -> Vacancies: relacionamento lógico e operacional, mas sem FK declarada no schema atual

### Características do modelo lógico

- O relacionamento entre candidato e módulos de RH é forte e bem definido.
- O relacionamento entre vagas e admissões existe no domínio, mas não está materializado como FK no banco.
- Há uma forte dependência do identificador do candidato como chave de integração entre os módulos.

---

## 4. Dependências entre tabelas

### Tabelas que dependem de outras

- hr_evaluations depende de candidates
- hr_annotations depende de candidates
- hr_admissions depende de candidates
- hr_terminations depende de candidates
- hr_documentation depende de candidates
- hr_emergency_contacts depende de candidates
- hr_admissions, em termos de negócio, depende de vacancies, mas isso não está implementado como FK

### Tabelas que podem ser criadas primeiro

A ordem lógica de criação, do ponto de vista estrutural, é:

1. candidates
2. vacancies
3. hr_evaluations, hr_annotations, hr_admissions, hr_terminations, hr_documentation, hr_emergency_contacts

### Ordem recomendada para migração

- Primeira camada: candidates
- Segunda camada: vacancies (independente, mas importante para o módulo de recrutamento/contratação)
- Terceira camada: tabelas de RH dependentes de candidates

### Observação importante

A ordem atual das migrations seguiu esse mesmo raciocínio, embora a relação com vacancies tenha sido deixada como vínculo textual e não relacional.

---

## 5. Chaves

### Primary Keys

| Tabela | PK | Observação |
|---|---|---|
| candidates | id | UUID gerado por default com gen_random_uuid() |
| hr_evaluations | id | UUID |
| hr_annotations | id | UUID |
| hr_admissions | id | UUID |
| hr_terminations | id | UUID |
| hr_documentation | id | UUID |
| hr_emergency_contacts | id | UUID |
| vacancies | id | UUID |

### Foreign Keys

| Tabela | Coluna | Referência | Finalidade |
|---|---|---|---|
| hr_evaluations.candidate_id | candidate_id | candidates.id | ligar avaliação ao candidato |
| hr_annotations.candidate_id | candidate_id | candidates.id | ligar anotações ao candidato |
| hr_admissions.candidate_id | candidate_id | candidates.id | ligar admissão ao candidato |
| hr_terminations.candidate_id | candidate_id | candidates.id | ligar desligamento ao candidato |
| hr_documentation.candidate_id | candidate_id | candidates.id | ligar documentação ao candidato |
| hr_emergency_contacts.candidate_id | candidate_id | candidates.id | ligar contatos ao candidato |

### Unique Keys

| Tabela | Coluna | Finalidade |
|---|---|---|
| candidates | cpf | garantir unicidade do CPF |
| hr_evaluations | candidate_id | garantir 1:1 entre candidato e avaliação |
| hr_admissions | candidate_id | garantir 1:1 entre candidato e admissão |
| hr_terminations | candidate_id | garantir 1:1 entre candidato e desligamento |
| hr_documentation | candidate_id | garantir 1:1 entre candidato e documentação |

### Motivo das chaves

- PKs garantem identidade única das linhas.
- FKs preservam integridade relacional entre módulos do processo seletivo.
- Unique constraints em candidate_id evitam registros duplicados de módulos de workflow.
- Unique em CPF evita cadastro duplicado de candidato.

---

## 6. Constraints

### Constraints identificadas

- Primary Key em todas as tabelas principais
- Foreign Key em todas as tabelas de RH que apontam para candidates
- Unique em CPF e em candidate_id para os módulos de 1:1
- NOT NULL em colunas obrigatórias de cada tabela
- ON DELETE CASCADE nas FKs para limpar dependências quando o candidato é removido
- Defaults em campos como booleans, status e timestamps

### Finalidade das constraints

- garantir integridade referencial;
- impedir cadastro duplicado de candidatos e de registros de workflow;
- proteger o modelo contra inconsistências operacionais;
- facilitar a limpeza automática de dados relacionados.

### Observações

- Não foram identificadas CHECK constraints no schema atual.
- Não há constraint de domínio para status, etapas ou tipos de documento.
- O relacionamento com vacancies não possui constraint física, apenas uma convenção de aplicação.

---

## 7. Índices

### Índices existentes

Não há migrations com CREATE INDEX ou CREATE UNIQUE INDEX explícitos.

### Índices implícitos

- PKs geram índices internos do PostgreSQL;
- Unique constraints também geram índices implícitos;
- Isso cobre as operações de busca por id e por CPF, além de evitar duplicidade.

### Índices recomendados para o futuro

Os seguintes índices seriam úteis para escalabilidade:

- idx_hr_annotations_candidate_id
- idx_hr_emergency_contacts_candidate_id
- idx_hr_admissions_vacancy_id
- idx_hr_evaluations_current_stage
- idx_vacancies_status
- idx_vacancies_unit_sector_shift

### Justificativa

Esses índices ajudariam em consultas frequentes feitas pelo painel RH e por relatórios, especialmente em cenários com volume maior de candidatos e vagas.

---

## 8. Campos obrigatórios

### candidates

#### Campos obrigatórios

- id
- cpf
- full_name
- birth_date
- marital_status
- mother_name
- whatsapp
- address
- address_number
- neighborhood
- city
- state
- education
- has_technical_course
- has_criminal_record
- salary_expectation
- immediate_start
- available_weekends
- available_holidays
- lgpd_consent
- created_at

#### Campos opcionais

- father_name
- course
- period
- completed_courses
- other_courses
- work_experiences
- resume_url
- other_files_urls
- selfie_url
- first_job
- nickname
- gender
- hr_data

#### Campos que aceitam NULL

- father_name
- course
- period
- instagram
- facebook
- desired_position_1
- resume_url
- other_files_urls
- selfie_url
- lgpd_consent_date
- nickname
- gender
- hr_data

### hr_evaluations

#### Campos obrigatórios

- id
- candidate_id
- ficha_validation
- management_validation
- director_validation
- proposal_presented
- proposal_accepted
- documentation_delivered
- candidate_hired
- talent_bank
- ns
- interview_status
- pcd
- current_stage
- created_at
- updated_at

#### Campos opcionais

- interview_date
- interview_attended
- interview_time
- interview_observation

#### Campos que aceitam NULL

- interview_date
- interview_attended
- interview_time
- interview_observation

### hr_annotations

#### Campos obrigatórios

- id
- candidate_id
- text
- created_at

#### Campos opcionais

- nenhum relevante

#### Campos que aceitam NULL

- nenhum

### hr_admissions

#### Campos obrigatórios

- id
- candidate_id
- created_at
- updated_at

#### Campos opcionais

- vacancy_id
- vacancy_display
- admission_status
- defined_salary
- store_unit
- work_hours
- expected_start_date
- observations

#### Campos que aceitam NULL

- todos os campos acima, exceto id, candidate_id, created_at e updated_at

### hr_terminations

#### Campos obrigatórios

- id
- candidate_id
- created_at
- updated_at

#### Campos opcionais

- request_date
- voluntary_termination
- termination_reason
- will_serve_notice
- notice_days
- last_work_day
- can_be_rehired
- confirmed

#### Campos que aceitam NULL

- todos os campos opcionais

### hr_documentation

#### Campos obrigatórios

- id
- candidate_id
- basic_doc_checked
- experience_contract_checked
- experience_extension_checked
- prior_notice_checked
- termination_contract_checked
- created_at
- updated_at

#### Campos opcionais

- datas de vencimento
- completed flags

#### Campos que aceitam NULL

- datas de vencimento
- basic_doc_completed
- experience_contract_completed
- experience_extension_completed
- prior_notice_completed
- termination_contract_completed

### hr_emergency_contacts

#### Campos obrigatórios

- id
- candidate_id
- name
- relationship
- phone
- created_at

#### Campos opcionais

- nenhum relevante

#### Campos que aceitam NULL

- nenhum

### vacancies

#### Campos obrigatórios

- id
- name
- unit
- shift
- sector
- type
- quantity
- work_hours_start
- work_hours_end
- gross_salary
- status
- created_at
- updated_at

#### Campos opcionais

- observation
- mission
- responsibilities
- expectations
- offerings

#### Campos que aceitam NULL

- observation
- mission
- responsibilities
- expectations
- offerings

---

## 9. Campos derivados

### Campos derivados ou de apresentação

- current_stage: representa o estágio atual do fluxo de avaliação; é usado como estado de pipeline e de apresentação.
- vacancy_display: valor denormalizado usado para exibir a vaga de forma legível sem precisar montar o texto no frontend.
- hr_data: payload JSON usado para dados auxiliares e compatibilidade com integrações futuras ou legadas.
- created_at/updated_at: metadados de auditoria, usados para ordenação e rastreio.
- basic_doc_completed, experience_contract_completed e demais flags de conclusão documental: funcionam como estado derivado de uma avaliação operacional, mas são persistidos diretamente.

### Observação

O schema atual mistura estado operacional real com campos de apresentação. Isso é prático, mas torna a regra de negócio menos explícita e mais dependente da camada de aplicação.

---

## 10. Campos legados

### Campos mantidos apenas por compatibilidade

- interview_status
- interview_attended

Esses campos foram preservados para compatibilizar o fluxo antigo com a camada de apresentação atual. O frontend faz uma normalização em TypeScript para converter valores como "Não"/"Sim" para uma representação mais amigável, como "Não Agendada" e "Agendada".

### Estratégia de compatibilidade

A estratégia atual é:

- manter os campos antigos no banco;
- tratar as leituras no frontend com uma camada de normalização;
- evitar remoção imediata para não quebrar dados históricos ou fluxos antigos.

### Outros campos de compatibilidade

- vacancy_display: serve como representação humana do vínculo com a vaga, mantendo um valor legível mesmo quando o relacionamento relacional não existe formalmente.
- hr_data: armazena dados em JSON para compatibilidade semântica com integrações ou evoluções futuras.

---

## 11. Evolução do Schema

A evolução do schema pode ser resumida da seguinte forma:

```text
Versão inicial
↓
Tabela candidates
↓
Módulo RH (hr_evaluations, hr_annotations, hr_admissions, hr_terminations, hr_documentation, hr_emergency_contacts)
↓
Módulo de vagas (vacancies)
↓
Novos campos e arquivos (selfie_url, first_job, pcd, nickname, gender, current_stage, interview_time, interview_observation)
↓
Última migration
```

### Linha do tempo das migrations

- 20260406124623: criação inicial de candidates e políticas básicas de acesso
- 20260406124738: ajuste de política para checagem anônima de CPF
- 20260407121554: adição de hr_data e política de update para candidates
- 20260408144708: criação das tabelas de RH e políticas de acesso
- 20260413114417: criação da tabela vacancies
- 20260414192346: adição de selfie_url e bucket selfies
- 20260414211454: adição de first_job
- 20260507161156: criação do bucket documents
- 20260513030530: adição de pcd
- 20260526124419: adição de nickname e gender
- 20260602155657: criação das RPCs candidate_cpf_exists e submit_candidate_application
- 20260603121354: adição de campos descritivos em vacancies
- 20260605204942: políticas de exclusão para storage
- 20260610161726: flexibilização de desired_position_1 para nullable
- 20260611172107: abertura de leitura anônima de vagas ativas
- 20260714204521: ajuste de políticas de leitura de storage para authenticated
- 20260720125305: adição de current_stage e ajuste de defaults de avaliação
- 20260727180000: adição de interview_time e interview_observation

---

## 12. Storage

### Buckets

#### selfies

- finalidade: armazenar fotos de perfil do candidato;
- arquivos armazenados: imagens de selfie;
- relacionamento com o banco: o caminho do arquivo é salvo em candidates.selfie_url.

#### documents

- finalidade: armazenar currículo e anexos diversos;
- arquivos armazenados: PDF, imagens e outros anexos;
- relacionamento com o banco: os caminhos são persistidos em candidates.resume_url e candidates.other_files_urls.

### Observação

O banco não armazena o conteúdo binário dos arquivos; ele armazena apenas referências de path. O fluxo de exibição usa URLs assinadas para recuperação segura.

---

## 13. RPCs

### candidate_cpf_exists()

#### Entrada

- p_cpf: texto contendo o CPF a ser verificado

#### Saída

- booleano indicando se já existe um candidato com esse CPF

#### Tabelas utilizadas

- candidates

#### Observações

A função sanitiza o CPF removendo caracteres não numéricos antes da consulta.

### submit_candidate_application()

#### Entrada

- p_payload: objeto JSON com os campos do formulário público de candidatura

#### Saída

- void

#### Tabelas utilizadas

- candidates

#### Comportamento

- usa o CPF como chave de upsert lógico;
- atualiza um candidato existente ou cria um novo;
- preserva URLs de arquivos já existentes quando o payload não envia novos valores;
- salva campos de formulário, consentimento e links de storage.

---

## 14. RLS

### Políticas observadas

#### candidates

- INSERT: qualquer pessoa pode inserir (formulário público)
- SELECT: somente usuários autenticados podem consultar
- UPDATE: usuários autenticados podem atualizar
- DELETE: não há política explícita

#### hr_evaluations

- SELECT: authenticated
- INSERT: authenticated
- UPDATE: authenticated
- DELETE: não há política explícita

#### hr_annotations

- SELECT: authenticated
- INSERT: authenticated
- UPDATE: authenticated
- DELETE: não há política explícita

#### hr_admissions

- SELECT: authenticated
- INSERT: authenticated
- UPDATE: authenticated
- DELETE: não há política explícita

#### hr_terminations

- SELECT: authenticated
- INSERT: authenticated
- UPDATE: authenticated
- DELETE: não há política explícita

#### hr_documentation

- SELECT: authenticated
- INSERT: authenticated
- UPDATE: authenticated
- DELETE: não há política explícita

#### hr_emergency_contacts

- SELECT: authenticated
- INSERT: authenticated
- UPDATE: authenticated
- DELETE: authenticated

#### vacancies

- SELECT: authenticated por padrão
- INSERT: authenticated
- UPDATE: authenticated
- SELECT anônimo: permitido apenas para vagas com status 'Ativa'

#### storage.objects (selfies)

- INSERT: público para upload
- SELECT: authenticated após ajustes posteriores
- DELETE: authenticated

#### storage.objects (documents)

- INSERT: público para upload
- SELECT: authenticated
- DELETE: authenticated

### Impacto da RLS

A camada de segurança é relativamente aberta para o fluxo operacional interno, e isso aumenta a facilidade de uso do sistema, mas reduz o isolamento entre diferentes papéis de usuário.

---

## 15. Fluxo de Persistência

### Fluxo geral

```text
Frontend
↓
Service / Contexto / Componente
↓
Supabase Client
↓
Tabela / RPC / Storage
```

### Exemplo 1: cadastro público de candidato

```text
[src/pages/Index.tsx]
↓
Nenhum service tradicional
↓
Supabase RPC submit_candidate_application
↓
public.candidates
↓
storage.selfies / storage.documents
```

### Exemplo 2: painel RH

```text
[src/pages/HRDashboard.tsx]
↓
[src/services/hrDataService.ts]
↓
Supabase Client
↓
public.hr_evaluations / public.hr_annotations / public.hr_admissions / public.hr_terminations / public.hr_documentation / public.hr_emergency_contacts
```

### Exemplo 3: gestão de vagas

```text
[src/components/vacancy/VacancyForm.tsx] ou [src/components/vacancy/VacancyList.tsx]
↓
[src/contexts/VacancyContext.tsx]
↓
Supabase Client
↓
public.vacancies
```

---

## 16. Pontos de Atenção

### Dependências fortes

- a maior parte do processamento de RH depende de candidate_id;
- a perda de um candidato pode propagar remoção em todos os módulos relacionados via ON DELETE CASCADE.

### Ausência de FK para vagas

- hr_admissions.vacancy_id não aponta para vacancies via FK declarada;
- a relação depende da aplicação para manter consistência.

### Campos legados

- interview_status e interview_attended ainda existem e precisam de mapeamento compatível;
- isso pode causar confusão semântica em futuras migrações.

### Possíveis gargalos

- ausência de índices explícitos em colunas de leitura frequente;
- uso de tabelas planas para documentos e evolução de workflow;
- persistência de estado em campos de string e booleans dispersos, sem enum ou tabela de status centralizada.

### Risco de evolução

- o schema atual funciona bem para a operação atual, mas tende a se tornar menos claro conforme o volume e a complexidade crescerem.

---

## 17. Melhorias Futuras

As melhorias abaixo não devem ser implementadas neste documento, mas merecem consideração em futuras entregas:

- substituir status em texto por enums ou tabelas de domínio;
- criar uma tabela de usuários e perfis de acesso;
- introduzir soft delete para preservar histórico e facilitar reversão;
- criar tabela de audit log para alterações de candidatos, vagas e avaliações;
- implementar FK real entre hr_admissions.vacancy_id e vacancies.id;
- introduzir índices explícitos para colunas de consulta frequente;
- normalizar a estrutura documental em tabelas próprias para tipos e versões de documento;
- centralizar os estados de workflow em uma tabela de etapas, em vez de manter múltiplos campos redundantes.

---

## 18. Conclusão

O schema atual do PeopleRH mostra um modelo funcional, simples e orientado à operação diária de recrutamento e RH. Ele é adequado para o estado atual do produto e preserva compatibilidade com o fluxo público e com o painel interno.

### Pontos fortes

- modelo claro para candidatos e módulos de RH;
- uso consistente de uma tabela central de candidatos;
- estrutura suficiente para o fluxo atual de avaliação, admissão e desligamento;
- integração com storage para arquivos.

### Limitações

- modelagem parcialmente denormalizada;
- dependência forte de campos textuais para status e workflow;
- relação entre vagas e admissões não é relacionalmente formalizada;
- ausência de índices explícitos e de mecanismo mais robusto de auditoria.

### Maturidade da modelagem

O schema atual está em um estágio de maturidade funcional, mas ainda não atingiu um nível de modelagem mais madura e extensível para crescimento orgânico do produto.

### Facilidade de evolução

A evolução é viável, mas exigirá cuidado para não quebrar compatibilidade com dados existentes e com as regras business atuais. A principal prioridade seria consolidar o modelo relacional de vagas e introduzir melhor padronização de status e auditoria.

### Riscos de manutenção

- inconsistência semântica entre campos legados e a camada de apresentação;
- crescimento do número de campos textuais e flags dispersas;
- necessidade crescente de operação manual para manter a integridade da relação entre vagas e admissões.

---

## Arquivos analisados

- [COPILOT_INSTRUCTIONS.md](COPILOT_INSTRUCTIONS.md)
- [docs/01_BACKEND_INVENTORY.md](docs/01_BACKEND_INVENTORY.md)
- [docs/02_BACKEND_ARCHITECTURE.md](docs/02_BACKEND_ARCHITECTURE.md)
- [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts)
- [src/services/hrDataService.ts](src/services/hrDataService.ts)
- [src/contexts/VacancyContext.tsx](src/contexts/VacancyContext.tsx)
- [src/types/candidate.ts](src/types/candidate.ts)
- [src/types/hr.ts](src/types/hr.ts)
- [src/types/vacancy.ts](src/types/vacancy.ts)
- [supabase/migrations](supabase/migrations)

## Migrations utilizadas na análise

- 20260406124623_2ba1abb6-9160-4ac6-9c4e-af94f5b33fa0.sql
- 20260406124738_a2be6aa2-5953-4702-aae7-855a3d968722.sql
- 20260407121554_6b1fe12f-3dbb-4f8c-95c7-dcc050727ecb.sql
- 20260408144708_00de251d-3407-4996-b9a6-015749114fd9.sql
- 20260413114417_d85b3b4e-4a1b-47f3-99f7-91e49f41f6b1.sql
- 20260414192346_e6b365ce-3454-4b84-b055-12d7f6a9cb37.sql
- 20260414211454_e1696b6b-f36f-4709-bdca-fb3281d4afce.sql
- 20260507161156_7de7d532-6c54-4714-87fa-825e8e9eb5fb.sql
- 20260513030530_bce38d8b-5522-4577-861c-844cfeef3c09.sql
- 20260526124419_0e9492a1-6c57-4552-a0b4-aac67e062459.sql
- 20260602155657_662f130b-600d-4360-b85b-30110b466312.sql
- 20260603121354_001b3740-1710-4aa9-94b9-082bf61c975d.sql
- 20260605204942_3280b339-6c65-4191-aa1c-c6c83ed44689.sql
- 20260610161726_3bc33e38-e474-40b3-86fd-46253f5c369d.sql
- 20260611172107_f4f8cf52-c437-43b5-9373-24581246417d.sql
- 20260714204521_ee929838-90d9-4c42-ad76-918b4a2650ae.sql
- 20260720125305_419cb02a-ce52-4a29-a531-ac433f471fb0.sql
- 20260727180000_add_interview_time_and_observation.sql

## Inconsistências encontradas entre código TypeScript e banco

Foram identificadas as seguintes inconsistências ou divergências importantes:

- O banco usa nomes snake_case, enquanto o frontend TypeScript trabalha com modelos camelCase e faz mapeamento manual.
- O campo interview_status no banco é mantido com valores antigos como "Não"/"Sim", enquanto o frontend normaliza isso para "Não Agendada"/"Agendada".
- A relação lógica entre vacancies e hr_admissions existe no domínio, mas não está implementada como FK no schema.
- O campo vacancy_display é um valor redundante para exibição, enquanto o relacionamento funcional depende de vacancy_id textual.
- O schema usa campos de workflow espalhados por várias colunas textuais/booleanas, enquanto o frontend já encapsula isso em um modelo de avaliação mais estruturado.

Essas divergências não impedem o funcionamento atual do sistema, mas são pontos relevantes para evolução futura do schema.
