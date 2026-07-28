# 06. Plano Operacional de Execução da Migração do PeopleRH

Este documento é o guia operacional oficial para executar a migração completa do banco de dados do PeopleRH para um novo projeto Supabase.

Ele foi elaborado para permitir que qualquer desenvolvedor siga a migração passo a passo, com segurança, rastreabilidade e possibilidade de rollback.

---

## 1. Objetivo

Este documento deverá ser seguido durante a migração real do ambiente atual para o novo projeto Supabase.

Seu objetivo é garantir que a migração seja executada de forma:

- ordenada;
- segura;
- rastreável;
- reversível;
- compatível com o funcionamento atual do sistema.

Ele serve como referência operacional para a equipe responsável pela migração.

---

## 2. Pré-requisitos

Antes de iniciar qualquer etapa, todos os itens abaixo devem estar disponíveis:

- nova conta Supabase própria e acessível;
- novo projeto Supabase criado e configurado;
- acesso administrativo ao projeto antigo e ao novo projeto;
- GitHub com repositório atualizado e branch de trabalho definida;
- projeto PeopleRH compilando localmente;
- Node.js instalado e funcional;
- Supabase CLI instalado e configurado;
- backup completo do banco atual validado;
- backup completo do storage atual validado;
- acesso ao ambiente antigo de produção e homologação;
- acesso ao ambiente novo de homologação;
- variáveis de ambiente conhecidas e documentadas;
- Vercel ou ambiente de deploy configurado para o novo projeto;
- equipe responsável alinhada com a execução e a janela de migração.

### Checklist de preparação

- [ ] projeto novo criado;
- [ ] autenticação configurada;
- [ ] storage habilitado;
- [ ] backup validado;
- [ ] GitHub atualizado;
- [ ] dependências locais instaladas;
- [ ] variáveis de ambiente documentadas;
- [ ] acesso à nova infraestrutura confirmado.

---

## 3. Ordem da Migração

O fluxo operacional da migração deve seguir esta ordem:

```text
Criar projeto Supabase
↓
Configurar Authentication
↓
Criar buckets de storage
↓
Executar migrations
↓
Criar schemas e objetos auxiliares
↓
Criar funções e RPCs
↓
Criar policies RLS
↓
Importar dados do banco
↓
Importar arquivos do storage
↓
Trocar variáveis de ambiente
↓
Publicar frontend
↓
Validar sistema
↓
Encerrar migração com rollback preparado
```

### Observação operacional

Cada etapa deve ser concluída com validação antes da próxima. A migração não deve avançar enquanto houver erro não resolvido.

---

## 4. Ordem das Migrations

Todas as migrations existentes devem ser aplicadas em ordem cronológica.

### Lista completa das migrations

1. 20260406124623_2ba1abb6-9160-4ac6-9c4e-af94f5b33fa0.sql
   - cria a tabela candidates;
   - habilita RLS inicial;
   - define policies básicas.

2. 20260406124738_a2be6aa2-5953-4702-aae7-855a3d968722.sql
   - ajusta a lógica de verificação de CPF.

3. 20260407121554_6b1fe12f-3dbb-4f8c-95c7-dcc050727ecb.sql
   - adiciona hr_data em candidates;
   - ajusta update policy.

4. 20260408144708_00de251d-3407-4996-b9a6-015749114fd9.sql
   - cria as tabelas de RH: hr_evaluations, hr_annotations, hr_admissions, hr_terminations, hr_documentation e hr_emergency_contacts;
   - habilita RLS para essas tabelas;
   - cria policies de leitura e escrita.

5. 20260413114417_d85b3b4e-4a1b-47f3-99f7-91e49f41f6b1.sql
   - cria a tabela vacancies.

6. 20260414192346_e6b365ce-3454-4b84-b055-12d7f6a9cb37.sql
   - adiciona selfie_url;
   - cria o bucket selfies.

7. 20260414211454_e1696b6b-f36f-4709-bdca-fb3281d4afce.sql
   - adiciona first_job.

8. 20260507161156_7de7d532-6c54-4714-87fa-825e8e9eb5fb.sql
   - cria o bucket documents.

9. 20260513030530_bce38d8b-5522-4577-861c-844cfeef3c09.sql
   - adiciona pcd.

10. 20260526124419_0e9492a1-6c57-4552-a0b4-aac67e062459.sql
    - adiciona nickname e gender.

11. 20260602155657_662f130b-600d-4360-b85b-30110b466312.sql
    - cria as RPCs candidate_cpf_exists e submit_candidate_application.

12. 20260603121354_001b3740-1710-4aa9-94b9-082bf61c975d.sql
    - adiciona campos descriptivos em vacancies.

13. 20260605204942_3280b339-6c65-4191-aa1c-c6c83ed44689.sql
    - cria policies de delete para storage.

14. 20260610161726_3bc33e38-e474-40b3-86fd-46253f5c369d.sql
    - torna desired_position_1 nullable.

15. 20260611172107_f4f8cf52-c437-43b5-9373-24581246417d.sql
    - cria política de leitura anônima de vagas ativas.

16. 20260714204521_ee929838-90d9-4c42-ad76-918b4a2650ae.sql
    - ajusta políticas de leitura do storage.

17. 20260720125305_419cb02a-ce52-4a29-a531-ac433f471fb0.sql
    - adiciona current_stage e altera defaults de avaliação.

18. 20260727180000_add_interview_time_and_observation.sql
    - adiciona interview_time e interview_observation.

### Por que a ordem não pode ser alterada

A ordem não pode ser alterada porque:

- as tabelas dependem de estruturas criadas anteriormente;
- as policies dependem de tabelas e buckets já existentes;
- as RPCs dependem da existência das tabelas que elas acessam;
- os defaults e colunas adicionais dependem da estrutura já criada em migrações anteriores.

---

## 5. Ordem de criação dos objetos

A criação dos objetos deve seguir a sequência abaixo:

```text
Schemas
↓
Tabelas
↓
Constraints
↓
Índices
↓
Views
↓
Functions
↓
RPCs
↓
Policies
↓
Buckets
```

### Detalhamento operacional

1. Schemas
   - garantir que o schema public exista e esteja ativo;
   - validar que o ambiente aceita o uso do schema atual.

2. Tabelas
   - criar as tabelas principais primeiro;
   - manter compatibilidade com o schema já documentado.

3. Constraints
   - criar primary keys, foreign keys e unique constraints;
   - preservar integridade referencial.

4. Índices
   - criar apenas os índices recomendados e necessários;
   - não introduzir índices desnecessários em uma migração inicial.

5. Views
   - não há views no projeto atual; esta etapa pode ser omitida se nada for necessário.

6. Functions
   - criar funções auxiliares, se houver necessidade futura.

7. RPCs
   - criar as funções RPCs após as Tabelas e Functions básicas.

8. Policies
   - aplicar as policies após a criação das tabelas e buckets.

9. Buckets
   - criar buckets antes do upload, para garantir a importação do storage.

---

## 6. Migração dos Dados

A importação dos dados deve ocorrer em ordem específica para reduzir inconsistências.

```text
candidates
↓
vacancies
↓
hr_evaluations
↓
hr_annotations
↓
hr_documentation
↓
hr_admissions
↓
hr_terminations
↓
hr_emergency_contacts
```

### Justificativa da ordem

- candidates deve entrar primeiro porque todas as demais tabelas dependem dele;
- vacancies deve vir em seguida para que o vínculo com admissões possa ser validado;
- hr_evaluations e hr_documentation podem ser importados logo após porque dependem diretamente de candidates;
- hr_annotations pode vir em seguida para manter o contexto RH;
- hr_admissions precisa de candidates e, logicamente, vacancies;
- hr_terminations e hr_emergency_contacts encerram a sequência porque dependem diretamente do candidato e não precisam preceder outras tabelas.

### Validação por tabela

- validar contagem de registros;
- validar campos obrigatórios;
- validar campos nulos e defaults;
- validar integridade do candidato associado.

---

## 7. Migração do Storage

### Bucket selfies

- criar o bucket selfies no novo projeto;
- preservar o nome do arquivo;
- preservar o path do objeto;
- preservar a referência em candidates.selfie_url.

### Bucket documents

- criar o bucket documents no novo projeto;
- preservar os nomes dos arquivos;
- preservar os paths relativos utilizados no sistema;
- preservar as referências em resume_url e other_files_urls.

### Como preservar paths

- exportar os objetos com os mesmos caminhos usados no ambiente atual;
- manter a mesma estrutura de diretórios, se existir;
- evitar renomear arquivos durante a importação.

### Como preservar nomes

- usar o mesmo nome original do arquivo;
- registrar os nomes em uma lista de validação;
- verificar se há conflitos de nome no novo bucket.

### Como preservar URLs

- manter a referência do storage path no banco;
- usar a mesma lógica de leitura e assinatura de URL no frontend;
- validar o funcionamento das URLs após a importação.

### Validação do storage

- verificar upload de selfie;
- verificar upload de currículo;
- verificar download de arquivos;
- verificar leitura via URL assinada.

---

## 8. Alteração do Frontend

### Variáveis de ambiente

O frontend precisa ser ajustado para consumir as variáveis do novo projeto Supabase.

#### Variável SUPABASE_URL

- deve apontar para o URL novo do projeto Supabase;
- deve ser alterada no ambiente local e no ambiente de deploy.

#### Variável SUPABASE_ANON_KEY

- deve apontar para a chave pública do novo projeto;
- deve ser alterada no ambiente local e no ambiente de deploy.

### Variáveis da Vercel

- atualizar as variáveis de ambiente na plataforma de deploy;
- garantir que o build receba os valores corretos;
- validar se o deploy usa as versões corretas das variáveis.

### Variáveis locais

- atualizar o arquivo de ambiente local utilizado pelo projeto;
- garantir que o build local continue funcionando.

### Build

- executar build local para validar que o projeto continua funcionando com as novas variáveis;
- verificar se não há erro de runtime associado ao novo endpoint.

### Deploy

- publicar a aplicação após a validação local;
- confirmar que o frontend passa a consumir o novo projeto Supabase.

---

## 9. Plano de Validação

A validação deve ser executada após a migração completa.

### Checklist operacional

- [ ] login RH
- [ ] cadastro candidato
- [ ] upload selfie
- [ ] upload currículo
- [ ] Kanban
- [ ] contratação
- [ ] documentação
- [ ] desligamento
- [ ] relatórios
- [ ] vagas
- [ ] filtros
- [ ] impressão
- [ ] download
- [ ] storage
- [ ] RPC candidate_cpf_exists
- [ ] RPC submit_candidate_application
- [ ] policies RLS
- [ ] leitura e escrita de dados

### Validação funcional

- validar que o fluxo público funciona;
- validar que o painel RH funciona;
- validar que a gestão de vagas continua correta;
- validar que a movimentação do pipeline ocorre sem inconsistências.

---

## 10. Plano de Rollback

Se qualquer etapa falhar, o rollback deve ser acionado de forma rápida e previsível.

### Procedimentos de rollback

1. manter o ambiente antigo ativo até a validação completa;
2. reverter as variáveis do frontend para o ambiente antigo;
3. reativar o deploy anterior;
4. restaurar backup do banco se houver inconsistência grave;
5. restaurar backup do storage se houver perda ou corrupção;
6. confirmar que o sistema antigo voltou a operar.

### Quando acionar rollback

- erro de importação de dados;
- falha de storage;
- falha de autenticação;
- comportamento incorreto do frontend;
- inconsistência crítica de dados.

### Tempo estimado para rollback

O rollback deve ser preparado para acontecer em poucas horas, desde que o ambiente antigo continue disponível e o backup esteja íntegro.

---

## 11. Tempo estimado

### Preparação

- estimativa: 1 a 2 dias
- atividades: criar projeto, configurar ambiente, validar backup, preparar variáveis.

### Migração

- estimativa: 1 a 2 dias
- atividades: aplicar migrations, importar dados e storage.

### Validação

- estimativa: 1 a 2 dias
- atividades: executar checklist, validar fluxos, comparar ambientes.

### Troca

- estimativa: algumas horas
- atividades: trocar variáveis, publicar frontend e validar produção.

### Rollback

- estimativa: algumas horas
- atividades: reverter para ambiente antigo e restaurar backup se necessário.

---

## 12. Critérios de sucesso

A migração pode ser considerada concluída apenas quando:

- todas as migrations foram aplicadas corretamente;
- todos os dados foram importados sem perda;
- todos os buckets e arquivos do storage foram migrados;
- o frontend aponta para o novo projeto com sucesso;
- o cadastro público funciona;
- o painel RH funciona;
- vagas, admissões, documentação e desligamentos funcionam;
- as RPCs funcionam;
- as policies RLS funcionam;
- o rollback está preparado e validado.

---

## Quadro de Riscos

| Risco | Impacto | Probabilidade | Mitigação | Status |
|---|---|---|---|---|
| Perda de dados durante importação | Alto | Média | Backup completo, validação por lote e comparação de registros | Aberto |
| Divergência de schema entre ambientes | Alto | Média | Aplicar migrations em ordem correta e validar o resultado após cada etapa | Aberto |
| Falha em políticas RLS | Alto | Média | Recriar e validar policies no novo projeto antes da troca | Aberto |
| Falha de storage | Alto | Média | Validar buckets, paths e URLs após importação | Aberto |
| Incompatibilidade de variáveis de ambiente | Alto | Média | Atualizar local e Vercel antes da publicação | Aberto |
| Erro na ordem das migrations | Médio | Média | Seguir rigorosamente a ordem cronológica | Aberto |
| Problema na relação entre vagas e admissões | Médio | Alta | Validar fluxo após a importação e revisar vínculos | Aberto |
| Falha de rollback | Alto | Média | Manter ambiente antigo ativo e backup disponível | Aberto |
