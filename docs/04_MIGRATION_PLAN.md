# 04. Plano Oficial de Migração do Supabase do PeopleRH

Este documento descreve o plano oficial de migração do banco de dados, storage e integrações do PeopleRH do ambiente Supabase atual (Lovable) para um novo projeto Supabase administrado pelo proprietário do sistema.

O plano foi elaborado com base no estado atual do projeto, nas migrations existentes, nas políticas RLS, nas RPCs, nos buckets de storage e no fluxo do frontend React/TypeScript.

---

## 1. Objetivo

### Por que a migração será realizada

A migração é necessária para:

- transferir a propriedade e o controle do ambiente Supabase para o proprietário do sistema;
- reduzir dependência de um ambiente externo e gerenciado por terceiros;
- garantir maior autonomia para manutenção, backup, segurança e evolução do produto;
- preservar o funcionamento do PeopleRH com um ambiente profissional e administrável de forma independente.

### Benefícios esperados

- maior autonomia operacional sobre banco, storage e políticas;
- maior controle sobre versionamento, ambientes e permissões;
- possibilidade de evoluir o schema com mais segurança e clareza;
- melhor alinhamento com o modelo de arquitetura desejado para o produto.

### Riscos

- perda ou inconsistência de dados durante a transferência;
- incompatibilidade entre a configuração atual do frontend e o novo projeto Supabase;
- divergência de políticas RLS e permissões entre ambientes;
- falhas em arquivos de storage e URLs de referência;
- impacto operacional caso a troca ocorra sem validação completa.

### Estratégia adotada

A estratégia será baseada em uma migração planejada, controlada e reversível:

```text
Nova infraestrutura
↓
Migração validada
↓
Troca controlada
↓
Rollback possível
```

A abordagem prioriza segurança, preservação de dados e ausência de migração destrutiva.

---

## 2. Escopo

### Banco de Dados

Será migrado o conjunto de estruturas abaixo:

- tabela public.candidates
- tabela public.hr_evaluations
- tabela public.hr_annotations
- tabela public.hr_admissions
- tabela public.hr_terminations
- tabela public.hr_documentation
- tabela public.hr_emergency_contacts
- tabela public.vacancies

Também serão considerados:

- constraints
- chaves primárias e estrangeiras
- unique constraints
- defaults
- colunas adicionadas por migrations posteriores

### Storage

Será migrado o conteúdo armazenado nos buckets:

- selfies
- documents

### Buckets

Serão re-criados no novo projeto Supabase os buckets compatíveis com o fluxo atual:

- selfies
- documents

### Policies

Serão reimplementadas as políticas de segurança atuais para garantir compatibilidade com o fluxo de cadastro público e o painel RH.

### RPCs

Serão re-criadas as funções SQL abaixo:

- candidate_cpf_exists()
- submit_candidate_application()

### Functions

Serão reimplantadas as funções SQL necessárias para execução correta do formulário público e do fluxo interno.

### Views

Não há views documentadas no schema atual. Nenhuma view precisa ser migrada neste momento.

### Migrations

Todas as migrations existentes serão analisadas e aplicadas na ordem correta no novo ambiente, preservando a evolução do schema.

### Variáveis de ambiente

As variáveis atuais de frontend serão adaptadas para o novo ambiente e documentadas sem exposição de valores reais.

### Frontend

Será ajustado o frontend para consumir as variáveis do novo projeto, mantendo o comportamento atual.

### Deploy

O deploy em Vercel ou outro ambiente de publicação será atualizado para apontar para o novo projeto Supabase, preservando a experiência do usuário.

---

## 3. Pré-requisitos

Antes da execução da migração, devem existir os seguintes itens:

- conta Supabase própria e acessível pelo proprietário;
- novo projeto Supabase criado e configurado;
- acesso administrativo ao projeto novo;
- repositório GitHub atualizado e com branch de trabalho adequada;
- projeto funcionando localmente com ambiente de desenvolvimento válido;
- backup válido do ambiente atual, incluindo banco e storage;
- documentação das variáveis de ambiente atual;
- Vercel ou equivalente configurado para deploy;
- acesso aos arquivos e buckets atuais do ambiente Lovable;
- plano de validação aprovado pela equipe responsável.

---

## 4. Estratégia Geral

A migração será executada em quatro fases principais:

```text
Nova infraestrutura
↓
Migração validada
↓
Troca controlada
↓
Rollback possível
```

### Princípios da estratégia

- nunca realizar migração destrutiva;
- sempre preservar os dados atuais como fonte de verdade até a validação final;
- testar a nova infraestrutura antes da troca;
- manter o ambiente antigo disponível até a validação completa;
- aplicar a mudança em etapas para reduzir risco operacional.

### Abordagem escolhida

1. provisionar um novo projeto Supabase próprio;
2. replicar a estrutura de banco e storage;
3. validar o funcionamento em ambiente de homologação;
4. trocar o endpoint e as chaves do projeto no frontend;
5. publicar a nova configuração com monitoramento e rollback preparado.

---

## 5. Ordem da Migração

A execução deverá seguir esta ordem:

1. Criar o novo projeto Supabase
   - definir nome, região e configuração inicial;
   - habilitar módulos necessários, como Storage e Authentication.

2. Configurar Authentication
   - revisar se o fluxo público de candidatura precisa de anon/authenticated;
   - garantir que os esquemas e políticas estejam compatíveis com o fluxo atual.

3. Criar buckets de storage
   - selfies
   - documents
   - validar permissões de upload e leitura.

4. Aplicar migrations no novo projeto
   - criar tabelas e colunas conforme a ordem histórica das migrations;
   - preservar defaults e constraints.

5. Criar RPCs e funções SQL
   - candidate_cpf_exists
   - submit_candidate_application

6. Criar policies RLS
   - permissões para candidatos públicos;
   - permissões para usuários autenticados;
   - permissões para storage.

7. Exportar e importar dados do banco
   - candidatos
   - avaliações
   - anotações
   - admissões
   - documentação
   - contatos de emergência
   - vagas
   - desligamentos

8. Exportar e importar arquivos de storage
   - selfies
   - currículos/arquivos diversos

9. Atualizar variáveis de ambiente no frontend
   - novo URL do projeto;
   - nova publishable key;
   - nova configuração de projeto.

10. Publicar o frontend na nova configuração
   - validar o deploy e o acesso ao sistema.

11. Validar produção
   - rodar checklist completo de fluxo e monitorar comportamento.

### Detalhes operacionais da ordem

A ordem acima reduz riscos porque:

- primeiro é criado o ambiente alvo;
- depois a estrutura de dados;
- em seguida os acessos e funções;
- só então os dados e arquivos;
- por fim o frontend passa a consumir o novo ambiente.

---

## 6. Migração das Migrations

### Ordem correta

A ordem correta de aplicação das migrations é a mesma observada pelo histórico do projeto, já que as alterações são cumulativas e dependem de estruturas criadas anteriormente.

#### Ordem recomendada

1. 20260406124623_2ba1abb6-9160-4ac6-9c4e-af94f5b33fa0.sql
   - cria a tabela candidates
   - habilita RLS
   - cria políticas iniciais

2. 20260406124738_a2be6aa2-5953-4702-aae7-855a3d968722.sql
   - ajusta a política de CPF existence

3. 20260407121554_6b1fe12f-3dbb-4f8c-95c7-dcc050727ecb.sql
   - adiciona hr_data e política de update em candidates

4. 20260408144708_00de251d-3407-4996-b9a6-015749114fd9.sql
   - cria as tabelas de RH
   - habilita RLS para as novas tabelas
   - define políticas CRUD para RH

5. 20260413114417_d85b3b4e-4a1b-47f3-99f7-91e49f41f6b1.sql
   - cria vacancies

6. 20260414192346_e6b365ce-3454-4b84-b055-12d7f6a9cb37.sql
   - adiciona selfie_url e cria bucket selfies

7. 20260414211454_e1696b6b-f36f-4709-bdca-fb3281d4afce.sql
   - adiciona first_job

8. 20260507161156_7de7d532-6c54-4714-87fa-825e8e9eb5fb.sql
   - cria bucket documents

9. 20260513030530_bce38d8b-5522-4577-861c-844cfeef3c09.sql
   - adiciona pcd

10. 20260526124419_0e9492a1-6c57-4552-a0b4-aac67e062459.sql
    - adiciona nickname e gender

11. 20260602155657_662f130b-600d-4360-b85b-30110b466312.sql
    - cria RPCs candidate_cpf_exists e submit_candidate_application

12. 20260603121354_001b3740-1710-4aa9-94b9-082bf61c975d.sql
    - adiciona campos textuais em vacancies

13. 20260605204942_3280b339-6c65-4191-aa1c-c6c83ed44689.sql
    - cria políticas de delete para storage

14. 20260610161726_3bc33e38-e474-40b3-86fd-46253f5c369d.sql
    - torna desired_position_1 nullable

15. 20260611172107_f4f8cf52-c437-43b5-9373-24581246417d.sql
    - habilita acesso anônimo a vagas ativas

16. 20260714204521_ee929838-90d9-4c42-ad76-918b4a2650ae.sql
    - ajusta políticas de leitura de storage

17. 20260720125305_419cb02a-ce52-4a29-a531-ac433f471fb0.sql
    - adiciona current_stage e altera defaults de avaliação

18. 20260727180000_add_interview_time_and_observation.sql
    - adiciona interview_time e interview_observation

### Dependências

- candidates deve existir antes de qualquer tabela de RH;
- vacancies pode ser criada logo após candidates, mas não é dependente para a estrutura inicial de RH;
- as RPCs dependem da existência de candidates;
- os buckets precisam existir antes dos uploads;
- policies dependem das tabelas e buckets já criados.

### Possíveis conflitos

- políticas antigas podem não ser aceitas exatamente da mesma forma em um projeto novo sem o mesmo contexto de autenticação;
- nomes de policies e buckets podem precisar ser reavaliados;
- defaults textuais podem não corresponder exatamente ao estado atual se os dados forem importados em outra ordem;
- compatibilidade de tipos entre o projeto antigo e o novo ambiente deve ser validada após a importação.

### Riscos

- risco médio: diferenças de ambiente ou configuração do projeto novo;
- risco alto: inconsistência de dados se a importação for feita em ordem inadequada;
- risco médio: falhas em políticas de storage se a autorização for alterada.

---

## 7. Migração dos Dados

### Candidates

#### Estratégia

- exportar todos os registros de public.candidates;
- validar integridade de CPF e campos obrigatórios;
- importar em lotes para evitar problemas de timeout;
- preservar id quando possível para manter a coerência com dependências já existentes no frontend.

#### Dependências

- não há dependência estrutural externa além de outras tabelas de RH que referenciam candidate_id.

### Vacancies

#### Estratégia

- exportar public.vacancies;
- importar após a criação da tabela;
- validar quantity, status, unit, sector, shift e gross_salary.

#### Dependências

- ligações com hr_admissions serão tratadas no processo de importação das admissões.

### HR Evaluations

#### Estratégia

- importar registros de public.hr_evaluations após candidates;
- validar current_stage e campos de entrevista;
- preservar candidate_id.

#### Dependências

- depende de candidates.

### Documentation

#### Estratégia

- importar public.hr_documentation após candidates;
- validar booleans e datas textuais;
- preservar candidate_id.

#### Dependências

- depende de candidates.

### Admissions

#### Estratégia

- importar public.hr_admissions após candidates e vacancies;
- preservar candidate_id e vacancy_id;
- validar consistência do vínculo com vaga.

#### Dependências

- depende de candidates;
- depende logicamente de vacancies, mesmo sem FK real.

### Annotations

#### Estratégia

- importar public.hr_annotations após candidates;
- validar texto e created_at.

#### Dependências

- depende de candidates.

### Emergency Contacts

#### Estratégia

- importar public.hr_emergency_contacts após candidates;
- validar name, relationship e phone.

#### Dependências

- depende de candidates.

### Terminations

#### Estratégia

- importar public.hr_terminations após candidates;
- validar booleans e campos de aviso prévio.

#### Dependências

- depende de candidates.

### Ordem recomendada de importação

1. candidates
2. vacancies
3. hr_evaluations
4. hr_documentation
5. hr_admissions
6. hr_terminations
7. hr_annotations
8. hr_emergency_contacts

Isso reduz o risco de dependência incompleta e facilita a validação por módulo.

---

## 8. Migração do Storage

### Buckets

Os buckets a serem migrados são:

- selfies
- documents

### Arquivos

Será necessário migrar os arquivos físicos armazenados no storage atual para o novo projeto Supabase.

### Selfies

#### Estratégia de exportação

- listar todos os objetos do bucket selfies;
- exportar os arquivos com seus paths originais;
- preservar a estrutura de path para que o campo selfie_url continue apontando corretamente.

#### Estratégia de importação

- criar o bucket selfies no novo projeto;
- importar os arquivos mantendo os mesmos caminhos relativos;
- validar que os arquivos continuam acessíveis através das URLs referenciadas no banco.

### Currículos e outros documentos

#### Estratégia de exportação

- exportar todos os objetos do bucket documents;
- registrar os paths e os dados associados no banco.

#### Estratégia de importação

- importar os arquivos com os paths preservados;
- validar que os campos resume_url e other_files_urls continuam apontando para arquivos válidos.

### Estratégia geral de storage

- preservar paths e nomes de arquivos;
- fazer importação em lote;
- validar a integridade de cada arquivo após o upload;
- revisar URLs assinadas e links já existentes no frontend.

### Validação de storage

- verificar upload de novas selfies;
- verificar upload de currículos e anexos;
- verificar visualização correta no painel RH;
- verificar downloads realizados pelo frontend.

---

## 9. Variáveis de Ambiente

As variáveis atualmente utilizadas no frontend são as seguintes:

### VITE_SUPABASE_URL

- origem: arquivo .env local do projeto;
- finalidade: apontar o endpoint do projeto Supabase para o cliente frontend;
- local de alteração: ambiente de build e deploy;
- impacto: altera completamente o destino das operações do frontend.

### VITE_SUPABASE_PUBLISHABLE_KEY

- origem: arquivo .env local do projeto;
- finalidade: autenticar o cliente frontend com o projeto Supabase;
- local de alteração: ambiente de build e deploy;
- impacto: sem essa variável correta, o app não consegue acessar o banco nem o storage.

### VITE_SUPABASE_PROJECT_ID

- origem: arquivo .env local do projeto;
- finalidade: identificar o projeto dentro do ambiente atual e facilitar a documentação e o rastreamento;
- local de alteração: ambiente de build/deploy ou configuração de projeto;
- impacto: não é a variável principal de runtime, mas deve ser mantida coerente com o novo projeto.

### Observação

Não devem ser expostos valores reais nas documentações. O processo de migração deve atualizar esses valores no ambiente correto, sem manter secrets em repositório público.

---

## 10. Validação

A validação deverá seguir uma checklist completa antes da troca definitiva.

### Cadastro público

- verificar cadastro de novo candidato;
- verificar CPF duplicado;
- verificar persistência de dados pessoais e LGPD.

### Login RH

- verificar acesso autenticado ao painel RH;
- verificar leitura e escrita nas tabelas protegidas;
- confirmar que usuários não autorizados não acessam dados sensíveis.

### Kanban

- verificar que as avaliações aparecem corretamente;
- validar current_stage e filtros do fluxo.

### Dashboard

- validar leitura de candidatos e listagem geral.

### Vagas

- validar criação, atualização e exclusão;
- validar débito e crédito da quantidade;
- verificar dependências de admissões.

### Anotações

- criar, listar e consultar anotações.

### Contratação

- validar fluxo de admissão e vínculo com vaga.

### Desligamento

- validar salvamento do registro e reprocessamento da vaga.

### Filtros

- validar filtros por unidade, setor, turno, status e posição.

### Relatórios

- validar relatórios e painéis que dependem das tabelas de RH e vagas.

### Storage

- validar upload e download de arquivos.

### Uploads

- selfie
- currículo
- anexos diversos

### Downloads

- arquivos anexados
- currículos
- fotos

### RPCs

- testar candidate_cpf_exists
- testar submit_candidate_application

### Policies

- validar leitura, gravação, alteração e exclusão conforme o fluxo esperado.

---

## 11. Plano de Testes

### Testes funcionais

- cadastro público de candidato;
- painel RH lendo e editando dados;
- fluxo de admissões e desligamentos;
- fluxo de vagas;
- fluxo de upload e download de arquivos.

### Testes de integração

- frontend → Supabase client → banco;
- frontend → storage → bucket;
- RPC → tabela candidates;
- contexto de vagas → tabela vacancies e hr_admissions.

### Testes de banco

- verificar integridade referencial;
- validar constraints e defaults;
- validar unicidade de CPF e candidate_id;
- validar importação de registros antigos sem perdas.

### Testes de Storage

- upload de arquivos;
- download de arquivos;
- leitura de URLs assinadas;
- validação de metadados e paths.

### Testes de performance

- carregar lista de candidatos com volume realista;
- validar tempo de resposta em consultas por candidate_id;
- validar tempo de upload e leitura em storage.

### Testes de segurança

- validar RLS para acesso público e autenticado;
- validar que dados sensíveis não estejam expostos indevidamente;
- verificar políticas de storage e exclusão.

---

## 12. Plano de Rollback

O rollback deve ser preparado antes da troca definitiva.

### Gatilhos

O rollback deverá ser acionado se:

- houver perda de dados;
- houver falha em autenticação ou RLS;
- houver falha em uploads ou downloads;
- houver inconsistência entre frontend e banco;
- houver comportamento inesperado em produção.

### Procedimentos

1. manter o ambiente antigo operacional até a validação completa;
2. reverter as variáveis de ambiente do frontend para o ambiente antigo;
3. restaurar backup do banco e storage se necessário;
4. reativar o deploy antigo;
5. revisar logs e validar a recuperação do sistema.

### Tempo esperado

O rollback deve ser executado em poucas horas, desde que a configuração antiga esteja intacta e o backup esteja disponível.

### Impactos

- indisponibilidade limitada do sistema durante a troca;
- possível atraso em operações de cadastro e HR;
- necessidade de sincronização manual se houver dados alterados durante a janela de migração.

---

## 13. Critérios de Aceite

A migração será considerada concluída quando:

- todos os módulos funcionarem;
- nenhum dado for perdido;
- o storage estiver íntegro;
- todas as RPCs funcionarem;
- todos os uploads e downloads funcionarem;
- o painel RH estiver operando corretamente;
- o formulário público estiver operando corretamente;
- o rollback estiver preparado e validado.

---

## 14. Cronograma

### Fase 1 – Preparação

- revisar backup;
- organizar documentação;
- confirmar acesso aos ambientes;
- alinhar responsáveis.

### Fase 2 – Infraestrutura

- criar projeto Supabase novo;
- configurar Authentication e Storage;
- aplicar as migrations iniciais;
- criar buckets e policies.

### Fase 3 – Migração

- importar dados do banco;
- importar arquivos do storage;
- validar relacionamento entre tabelas;
- ajustar variáveis de ambiente.

### Fase 4 – Validação

- executar testes funcionais e de integração;
- validar storage e RPCs;
- comparar resultados com o ambiente antigo.

### Fase 5 – Go Live

- publicar o frontend na nova configuração;
- realizar monitoramento inicial;
- manter ambiente antigo como fallback temporário.

---

## 15. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Perda de dados durante exportação/importação | Média | Crítico | backup válido, validação por lote e comparação de contagem |
| Divergência de policies RLS | Média | Alto | reimplementar e validar cada policy no novo ambiente |
| Falha em storage | Média | Alto | verificar paths, importação de arquivos e URLs assinadas |
| Incompatibilidade de variáveis de ambiente | Média | Alto | atualizar .env e validar builds antes da publicação |
| Erro na ordem das migrations | Média | Médio | aplicar em sequência histórica e validar cada etapa |
| Problemas de relacionamento entre vagas e admissões | Alta | Médio | revisar vínculos e validar a lógica de negócio após a importação |
| Atrasos operacionais na troca | Média | Médio | executar em janela planejada com rollback preparado |

---

## 16. Melhorias Aproveitando a Migração

Durante a migração, faz sentido considerar as melhorias abaixo, sem implementá-las neste documento:

- substituir status em texto por enums ou tabela de domínio;
- criar foreign keys formais entre hr_admissions.vacancy_id e vacancies.id;
- implementar índices explícitos para consultas frequentes;
- criar tabela de audit log;
- criar tabela de usuários e perfis de acesso;
- implementar soft delete;
- separar melhor as configurações do ambiente e da aplicação;
- consolidar um modelo de histórico de alterações para candidatos e vagas.

---

## 17. Roadmap Pós-Migração

### Prioridade 1

- formalizar o relacionamento entre vagas e admissões;
- revisar políticas RLS e reduzir permissões desnecessárias;
- criar índices baseados em uso real.

### Prioridade 2

- introduzir uma estrutura mais madura de status e workflow;
- revisar campos legados e padronizar o modelo.

### Prioridade 3

- implementar auditoria e histórico de alterações;
- evoluir para um modelo mais normalizado e escalável.

---

## 18. Conclusão

A migração é viável e deve ser conduzida com cautela, pois o ambiente atual já funciona e possui dados e arquivos relevantes. O principal desafio não é a complexidade técnica do projeto em si, mas a preservação da integridade dos dados, das políticas, do storage e do fluxo operacional do frontend.

### Nível de risco

O risco é moderado a alto, principalmente por causa de:

- dependência de políticas e storage;
- relação implícita entre vagas e admissões;
- necessidade de preservar compatibilidade entre ambientes.

### Estimativa de complexidade

A complexidade é média/alta, considerando:

- múltiplas migrations;
- duas áreas de persistência (banco e storage);
- variáveis de ambiente e deploy;
- validação de fluxo completo do sistema.

### O que deve receber maior atenção

- reprodução fiel do schema e das policies;
- exportação/importação correta do storage;
- validação de todos os fluxos principais após a troca;
- preparação de rollback.

### Benefícios pós-migração

Após a migração, o PeopleRH passará a ter:

- infraestrutura própria e administrável;
- maior independência operacional;
- menor dependência de ambiente terceirizado;
- melhor base para evolução arquitetural e segurança.

---

## Documentos utilizados

- [COPILOT_INSTRUCTIONS.md](COPILOT_INSTRUCTIONS.md)
- [docs/01_BACKEND_INVENTORY.md](docs/01_BACKEND_INVENTORY.md)
- [docs/02_BACKEND_ARCHITECTURE.md](docs/02_BACKEND_ARCHITECTURE.md)
- [docs/03_DATABASE_SCHEMA.md](docs/03_DATABASE_SCHEMA.md)

## Migrations analisadas

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

## Tabelas analisadas

- candidates
- hr_evaluations
- hr_annotations
- hr_admissions
- hr_terminations
- hr_documentation
- hr_emergency_contacts
- vacancies

## Buckets analisados

- selfies
- documents

## RPCs analisadas

- candidate_cpf_exists()
- submit_candidate_application()
