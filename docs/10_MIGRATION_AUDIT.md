# Auditoria Oficial das Migrations do PeopleRH

## Escopo da análise

Este documento consolida a auditoria estática das migrations presentes em [supabase/migrations](../supabase/migrations) e a relação com a documentação técnica existente em [docs](.) e com o fluxo atual do frontend.

Premissas da análise:

- análise feita exclusivamente sobre os arquivos SQL existentes no repositório;
- nenhuma migration foi executada durante esta análise;
- nenhuma alteração de código ou de schema foi realizada;
- o objetivo é avaliar segurança, consistência, ordem e compatibilidade para a criação de um novo banco Supabase do zero.

---

## Resumo executivo

A suíte de migrations do PeopleRH é, em essência, viável para construção de um banco novo a partir do zero, mas não está completamente livre de riscos. A estrutura central do modelo está bem definida e a ordem cronológica é coerente. O ponto mais importante é que o schema evoluiu de forma funcional, porém com algumas inconsistências semânticas e com uma divergência entre o que o frontend espera e o que as migrations realmente persistem.

Conclusão sintética:

- a ordem cronológica está correta;
- as tabelas principais existem e recebem FKs adequadas;
- políticas RLS e buckets foram criados;
- existem funções e RPCs necessárias para o fluxo público;
- há inconsistências de compatibilidade com o frontend, especialmente nos campos de entrevista e no tratamento de storage.

---

## 1. Quantidade de migrations analisadas

Foram identificadas 18 migrations no diretório [supabase/migrations](../supabase/migrations).

---

## 2. Ordem cronológica correta

A ordem correta, com base no timestamp dos nomes dos arquivos, é a seguinte:

1. 20260406124623_2ba1abb6-9160-4ac6-9c4e-af94f5b33fa0.sql
2. 20260406124738_a2be6aa2-5953-4702-aae7-855a3d968722.sql
3. 20260407121554_6b1fe12f-3dbb-4f8c-95c7-dcc050727ecb.sql
4. 20260408144708_00de251d-3407-4996-b9a6-015749114fd9.sql
5. 20260413114417_d85b3b4e-4a1b-47f3-99f7-91e49f41f6b1.sql
6. 20260414192346_e6b365ce-3454-4b84-b055-12d7f6a9cb37.sql
7. 20260414211454_e1696b6b-f36f-4709-bdca-fb3281d4afce.sql
8. 20260507161156_7de7d532-6c54-4714-87fa-825e8e9eb5fb.sql
9. 20260513030530_bce38d8b-5522-4577-861c-844cfeef3c09.sql
10. 20260526124419_0e9492a1-6c57-4552-a0b4-aac67e062459.sql
11. 20260602155657_662f130b-600d-4360-b85b-30110b466312.sql
12. 20260603121354_001b3740-1710-4aa9-94b9-082bf61c975d.sql
13. 20260605204942_3280b339-6c65-4191-aa1c-c6c83ed44689.sql
14. 20260610161726_3bc33e38-e474-40b3-86fd-46253f5c369d.sql
15. 20260611172107_f4f8cf52-c437-43b5-9373-24581246417d.sql
16. 20260714204521_ee929838-90d9-4c42-ad76-918b4a2650ae.sql
17. 20260720125305_419cb02a-ce52-4a29-a531-ac433f471fb0.sql
18. 20260727180000_add_interview_time_and_observation.sql

### Observação sobre a ordem

A ordem está consistente e não há sinais de duplicidade ou de migrações que precisem ser reordenadas para a criação do schema principal.

---

## 3. Objetivo de cada migration

| Migration | Objetivo principal |
|---|---|
| 20260406124623... | Criar a tabela principal de candidatos e habilitar o fluxo público inicial de cadastro com RLS e policies básicas. |
| 20260406124738... | Criar uma policy de acesso anônimo para verificar existência de CPF. |
| 20260407121554... | Adicionar o campo hr_data aos candidatos e permitir atualização autenticada da ficha. |
| 20260408144708... | Criar as tabelas de RH: avaliações, anotações, admissões, desligamentos, documentação e contatos de emergência, além de policies de leitura/escrita autenticadas. |
| 20260413114417... | Criar a tabela de vagas. |
| 20260414192346... | Adicionar selfie_url e criar o bucket de storage selfies com policies públicas iniciais. |
| 20260414211454... | Adicionar o campo first_job em candidates. |
| 20260507161156... | Criar o bucket documents e policies iniciais de leitura/upload. |
| 20260513030530... | Adicionar o campo pcd em hr_evaluations. |
| 20260526124419... | Adicionar nickname e gender em candidates. |
| 20260602155657... | Substituir o acesso anônimo direto à tabela candidates por funções RPCs de validação de CPF e envio de candidatura. |
| 20260603121354... | Adicionar campos descritivos em vacancies. |
| 20260605204942... | Criar policies de delete para storage (selfies e documents). |
| 20260610161726... | Tornar desired_position_1 nullable. |
| 20260611172107... | Permitir leitura anônima de vagas ativas. |
| 20260714204521... | Ajustar as policies de leitura de storage para autenticação explícita. |
| 20260720125305... | Adicionar current_stage e ajustar defaults de validações internas em hr_evaluations. |
| 20260727180000... | Adicionar interview_time e interview_observation em hr_evaluations. |

---

## 4. Tabelas criadas e alteradas

### 4.1 Tabelas criadas

As seguintes tabelas são criadas pelas migrations:

- public.candidates
- public.hr_evaluations
- public.hr_annotations
- public.hr_admissions
- public.hr_terminations
- public.hr_documentation
- public.hr_emergency_contacts
- public.vacancies

### 4.2 Tabelas alteradas

As seguintes tabelas sofrem alterações posteriores:

- public.candidates: recebe colunas novas e mudança de constraint/privilegios.
- public.hr_evaluations: recebe colunas novas e defaults alterados.
- public.vacancies: recebe colunas novas.
- storage.objects: não é uma tabela do schema de aplicação, mas recebe policies de segurança em migrations.

---

## 5. Colunas adicionadas

### Colunas adicionadas em public.candidates

- hr_data (migr. 20260407121554)
- selfie_url (migr. 20260414192346)
- first_job (migr. 20260414211454)
- nickname (migr. 20260526124419)
- gender (migr. 20260526124419)

### Colunas adicionadas em public.hr_evaluations

- pcd (migr. 20260513030530)
- current_stage (migr. 20260720125305)
- interview_time (migr. 20260727180000)
- interview_observation (migr. 20260727180000)

### Colunas adicionadas em public.vacancies

- observation
- mission
- responsibilities
- expectations
- offerings

### Colunas removidas

Não há coluna removida diretamente em nenhuma migration. A única alteração relevante de nulidade é a mudança de desired_position_1 para nullable, que não é uma remoção de coluna, mas uma alteração de constraint de NOT NULL para NULL.

---

## 6. Índices criados

Não foram encontrados índices explícitos criados por `CREATE INDEX` nas migrations analisadas.

### Observação

Os índices implícitos existentes decorrem de:

- PKs;
- UNIQUE em CPF;
- UNIQUE em candidate_id nas tabelas 1:1;
- FKs.

---

## 7. Constraints criadas

### Constraints de chave primária

- todas as tabelas principais recebem PK via `PRIMARY KEY`.

### Constraints de unicidade

- public.candidates.cpf é UNIQUE.
- public.hr_evaluations.candidate_id é UNIQUE.
- public.hr_admissions.candidate_id é UNIQUE.
- public.hr_terminations.candidate_id é UNIQUE.
- public.hr_documentation.candidate_id é UNIQUE.

### Constraints de NOT NULL

- várias colunas obrigatórias nas tabelas criadas recebem `NOT NULL`.
- a migration 20260610161726 remove o NOT NULL de desired_position_1.

### Constraints de check

Não foram encontradas `CHECK` constraints nas migrations.

---

## 8. Foreign Keys criadas

As migrations criam as seguintes FKs:

| Tabela | Coluna | Referência |
|---|---|---|
| public.hr_evaluations.candidate_id | candidate_id | public.candidates(id) |
| public.hr_annotations.candidate_id | candidate_id | public.candidates(id) |
| public.hr_admissions.candidate_id | candidate_id | public.candidates(id) |
| public.hr_terminations.candidate_id | candidate_id | public.candidates(id) |
| public.hr_documentation.candidate_id | candidate_id | public.candidates(id) |
| public.hr_emergency_contacts.candidate_id | candidate_id | public.candidates(id) |

### Observação relevante

Não existe FK entre public.hr_admissions.vacancy_id e public.vacancies.id. A relação entre vaga e admissão continua sendo um vínculo operacional (texto), não relacional.

---

## 9. Views criadas

Não foram encontradas views criadas nas migrations analisadas.

---

## 10. Functions SQL criadas

Foram criadas duas funções SQL principais:

1. public.candidate_cpf_exists(p_cpf text)
   - retorna boolean;
   - usada para verificação anônima de CPF;
   - criada na migration 20260602155657.

2. public.submit_candidate_application(p_payload jsonb)
   - processa cadastro público de candidato;
   - realiza insert ou update por CPF;
   - criada na migration 20260602155657.

### Observação

Ambas as funções usam `SECURITY DEFINER` e `SET search_path = public`, o que é adequado para o fluxo público, mas exige atenção em ambientes com permissões diferentes.

---

## 11. RPCs criadas

As mesmas funções acima são expostas como RPCs para o frontend e para o fluxo público:

- candidate_cpf_exists
- submit_candidate_application

### Observação

Essas RPCs são fundamentais para o portal público de candidatura e aparecem como parte do fluxo esperado do frontend atual.

---

## 12. Triggers criados

Não foram encontrados triggers nas migrations analisadas.

---

## 13. Policies RLS criadas

### Policies em public.candidates

- insert público para qualquer pessoa;
- select autenticada;
- select anônimo para verificação de CPF removido e substituído por RPC;
- update autenticada.

### Policies em public.hr_* e public.vacancies

- select/insert/update autenticados nas tabelas de RH e em vacancies;
- delete apenas para contatos de emergência.

### Policies em storage.objects

- bucket selfies: upload público e leitura pública inicial;
- bucket documents: leitura/upload públicos iniciais;
- depois há ajustes para leitura autenticada;
- delete autenticado para selfies e documents.

### Observação de risco

As policies iniciais foram relativamente permissivas. Com o tempo, elas foram endurecidas, mas ainda há uma dependência forte de permissões de bucket e de políticas de storage muito abertas.

---

## 14. Buckets de storage criados

Foram criados os seguintes buckets:

- selfies
- documents

### Observação

Ambos são criados via `storage.buckets`, com `public = true` em sua criação inicial. Isso é compatível com o fluxo público atual, mas deve ser tratado com cuidado em um ambiente de produção mais restrito.

---

## 15. Alterações que afetam Authentication

As migrations que impactam diretamente o modelo de autenticação e permissões são:

- 20260406124623...: cria policies públicas e autenticadas em candidates;
- 20260406124738...: cria policy anônima para checagem de CPF;
- 20260407121554...: cria policy de update autenticada em candidates;
- 20260602155657...: remove o acesso direto anônimo à tabela candidates e substitui por funções RPC com `SECURITY DEFINER`;
- 20260611172107...: concede SELECT em vacancies para anon;
- 20260714204521...: troca leitura pública de buckets para leitura autenticada.

### Impacto geral

As migrations evoluíram de um modelo mais aberto para um modelo mais controlado, com foco em segurança e em separação entre fluxo público e fluxo RH autenticado.

---

## 16. Campos específicos: interview_status, interview_date, interview_attended, interview_time, interview_observation

### Mapeamento por campo

| Campo | Primeira aparição | Uso no código/frontend | Observação |
|---|---|---|---|
| interview_status | 20260408144708... | usado no fluxo de avaliações e no painel RH | valor inicial da migration é 'Não', enquanto o frontend atual trabalha com valores como 'Não Agendada' e 'Agendada' |
| interview_date | 20260408144708... | usado no fluxo de avaliações | compatível estruturalmente |
| interview_attended | 20260408144708... | usado no fluxo de avaliações | compatível estruturalmente |
| interview_time | 20260727180000... | não é persistido pelo fluxo atual de saveEvaluation | há divergência entre schema e implementação |
| interview_observation | 20260727180000... | não é persistido pelo fluxo atual de saveEvaluation | há divergência entre schema e implementação |

### Inconsistência identificada

A maior inconsistência observada é a seguinte:

- as migrations criam `interview_time` e `interview_observation` em 20260727180000;
- o frontend atual define esses campos no tipo de avaliação;
- no fluxo atual de persistência, o payload salvo em `hr_evaluations` não envia esses campos.

Isso significa que o schema suporta esses campos, mas o fluxo atual de escrita não os utiliza. Em termos práticos, a coluna existe, mas o backend/frontend podem não estar coerentes.

### Risco de falha ou incompatibilidade

- risco baixo de falha estrutural na execução das migrations;
- risco médio de incompatibilidade funcional com o frontend atual, especialmente para campos de entrevista que foram adicionados após a modelagem inicial.

---

## 17. Dependências entre entidades principais

### candidates

- tabela central do fluxo;
- referência para todas as outras tabelas de RH;
- base para o fluxo de candidatura pública e para o painel RH.

### hr_evaluations

- depende de candidates;
- armazena estado atual do processo, validações e entrevista.

### hr_annotations

- depende de candidates;
- registro de observações internas do RH.

### hr_admissions

- depende de candidates;
- possui vínculo operacional com vacancies via campo textual, mas sem FK declarada.

### hr_terminations

- depende de candidates;
- registra desligamento e encerramento.

### hr_documentation

- depende de candidates;
- controla documentos por candidato.

### hr_emergency_contacts

- depende de candidates;
- 1:N com candidato.

### vacancies

- não depende de outras tabelas no schema;
- é usada pelo módulo de recrutamento e por admissões, mas o relacionamento atual é textual e não relacional.

### buckets e storage

- dependem da existência do storage do Supabase;
- as policies dependem da existência dos buckets e do schema storage.

### RPCs

- dependem da existência das tabelas candidates e do schema public;
- são independentes das demais tabelas de RH para o fluxo básico.

---

## 18. Validação da migração

### É possível executar todas as migrations em um banco vazio?

SIM.

### Justificativa objetiva

Com base na análise estática dos arquivos SQL:

- a ordem cronológica é consistente;
- as tabelas e colunas são criadas em ordem adequada;
- as FKs, PKs e uniques são compatíveis com as dependências;
- as functions, RPCs e policies dependem de objetos que são criados antes;
- não há sintaxe claramente incompatível com o ambiente Supabase PostgreSQL.

### Limitação importante

A execução das migrations provavelmente funcionará, mas a implantação não será totalmente isenta de risco funcional. O banco será criado, porém podem existir divergências de comportamento em relação ao frontend atual, principalmente para os campos de entrevista e para o tratamento de storage.

---

## 19. Recomendação por migration

| Migration | Status | Risco | Prioridade | Ação recomendada |
|---|---|---|---|---|
| 20260406124623... | OK | Baixo | Alta | Manter como base do schema. |
| 20260406124738... | OK | Baixo | Média | Manter. |
| 20260407121554... | OK | Baixo | Média | Manter. |
| 20260408144708... | Atenção | Médio | Alta | Validar políticas RLS e compatibilidade das tabelas de RH. |
| 20260413114417... | OK | Baixo | Alta | Manter. |
| 20260414192346... | Atenção | Médio | Alta | Revisar permissões públicas do bucket selfies. |
| 20260414211454... | OK | Baixo | Média | Manter. |
| 20260507161156... | Atenção | Médio | Alta | Revisar permissões públicas do bucket documents. |
| 20260513030530... | OK | Baixo | Média | Manter. |
| 20260526124419... | OK | Baixo | Média | Manter. |
| 20260602155657... | Revisar | Médio | Alta | Validar as RPCs e os fluxos de insert/update do formulário público. |
| 20260603121354... | OK | Baixo | Média | Manter. |
| 20260605204942... | OK | Baixo | Média | Manter. |
| 20260610161726... | OK | Baixo | Baixa | Manter. |
| 20260611172107... | Atenção | Médio | Média | validar impacto da leitura anônima de vagas ativas. |
| 20260714204521... | Revisar | Médio | Alta | revisar o novo modelo de leitura autenticada para storage. |
| 20260720125305... | OK | Baixo | Média | Manter. |
| 20260727180000... | Revisar | Médio | Alta | alinhar frontend e backend para interview_time e interview_observation. |

### Classificação geral

- OK: estrutura base estável e compatível.
- Atenção: a migration funciona, mas tem implicações operacionais ou de segurança.
- Revisar: há inconsistência funcional ou semântica que merece análise antes de usar como base definitiva.
- Obsoleta: nenhuma migration analisada aparenta estar obsoleta no sentido de ser inútil; todas participam do modelo atual.

---

## 20. Checklist final

- [x] Ordem validada
- [x] Dependências validadas
- [x] Schema consistente
- [x] Buckets consistentes
- [x] Policies consistentes
- [x] RPCs consistentes
- [ ] Sem conflitos
- [ ] Pronto para criar novo banco

### Observação final do checklist

O schema é consistente o suficiente para criar um banco novo, mas ainda há conflitos semânticos e de integração com o frontend que impedem considerar a base como totalmente pronta para produção sem revisão.

---

## 21. Conclusão técnica

Se este projeto fosse criado hoje, utilizando apenas as migrations existentes no repositório, o banco seria criado com sucesso do ponto de vista estrutural e de execução SQL. No entanto, a solução não estaria totalmente alinhada com o frontend atual e não seria ideal para operação sem revisão.

### Justificativa técnica

- o schema base foi construído com sucesso e a ordem cronológica está correta;
- as tabelas principais, FKs, policies e RPCs existem e são coerentes com o fluxo do sistema;
- há, porém, inconsistências operacionais importantes:
  - campos de entrevista adicionados, mas não plenamente consumidos pelo fluxo atual;
  - políticas de storage mais abertas do que o modelo moderno de segurança exigiria;
  - relacionamento entre vagas e admissões ainda textual, sem FK formal;
  - alguns defaults e estados da UI não coincidem com os valores inicializados na migration.

### Resposta final

O novo banco seria criado, mas a migração não pode ser considerada completamente segura e compatível com o frontend atual sem revisão prévia das migrations 20260727180000, 20260602155657 e das policies de storage.

---

## Resumo final

- migrations analisadas: 18
- tabelas identificadas: 8
- problemas principais encontrados: 4
- recomendações: 7
- conclusão final sobre a segurança da migração: a migração é executável e estruturalmente coerente, mas ainda exige revisão antes de ser tratada como base totalmente segura e compatível para um novo ambiente Supabase.
