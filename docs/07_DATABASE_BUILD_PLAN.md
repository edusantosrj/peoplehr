# 07. Plano de Construção do Banco de Dados do PeopleRH

## 1. Objetivo

Este documento define o plano completo para reconstruir o banco de dados do PeopleRH em uma conta totalmente nova do Supabase, sem qualquer dependência do Lovable.

O novo banco deverá ser criado e administrado exclusivamente pelo proprietário do projeto, com controle total sobre:

- estrutura do banco;
- políticas de segurança;
- buckets de storage;
- funções e RPCs;
- migrações e versionamento;
- ambiente de produção e homologação.

A reconstrução deve preservar a compatibilidade funcional do sistema atual, sem introduzir alterações de negócio não previstas.

---

## 2. Ordem correta de criação

A criação do ambiente deve seguir esta ordem operacional:

1. Projeto Supabase
2. Authentication
3. Storage
4. Buckets
5. Tabelas
6. Constraints
7. FKs
8. Indexes
9. Views
10. Functions
11. RPCs
12. Policies RLS
13. Triggers
14. Dados iniciais
15. Validação
16. Deploy

### Observação importante

A ordem acima evita dependências incompletas e garante que cada objeto seja criado somente após os componentes que ele precisa.

---

## 3. Lista completa das tabelas

### 3.1 public.candidates

- Objetivo: tabela principal do processo seletivo, concentrando os dados cadastrais e de candidatura do candidato.
- Dependências: nenhuma, além de storage para arquivos vinculados.
- Quem grava: formulário público de candidatura e usuários RH via edição interna.
- Quem lê: público anônimo para ver vagas e candidatos autenticados para gestão interna.
- Quem altera: RH e fluxo público via função RPC de cadastro.

### 3.2 public.vacancies

- Objetivo: catálogo de vagas abertas, com unidade, setor, turno, quantidade e status.
- Dependências: nenhuma diretamente, mas operacionalmente relacionada a admissões.
- Quem grava: RH.
- Quem lê: RH e usuários anônimos para visualização de vagas ativas.
- Quem altera: RH.

### 3.3 public.hr_evaluations

- Objetivo: registrar o estado de avaliação do candidato, validações internas e estágio atual do processo.
- Dependências: public.candidates.
- Quem grava: RH.
- Quem lê: RH.
- Quem altera: RH.

### 3.4 public.hr_annotations

- Objetivo: armazenar anotações internas do RH sobre cada candidato.
- Dependências: public.candidates.
- Quem grava: RH.
- Quem lê: RH.
- Quem altera: RH.

### 3.5 public.hr_admissions

- Objetivo: registrar a admissão/contratação de um candidato e o vínculo com uma vaga.
- Dependências: public.candidates e, em termos de negócio, public.vacancies.
- Quem grava: RH.
- Quem lê: RH.
- Quem altera: RH.

### 3.6 public.hr_terminations

- Objetivo: registrar desligamento e encerramento do processo do candidato.
- Dependências: public.candidates.
- Quem grava: RH.
- Quem lê: RH.
- Quem altera: RH.

### 3.7 public.hr_documentation

- Objetivo: controlar a situação documental do candidato em relação a documentos de contratação ou desligamento.
- Dependências: public.candidates.
- Quem grava: RH.
- Quem lê: RH.
- Quem altera: RH.

### 3.8 public.hr_emergency_contacts

- Objetivo: armazenar contatos de emergência vinculados ao candidato.
- Dependências: public.candidates.
- Quem grava: RH.
- Quem lê: RH.
- Quem altera: RH.

---

## 4. Ordem de criação das tabelas

A ordem recomendada é:

1. public.candidates
2. public.vacancies
3. public.hr_evaluations
4. public.hr_annotations
5. public.hr_admissions
6. public.hr_terminations
7. public.hr_documentation
8. public.hr_emergency_contacts

### Por que essa ordem deve ser seguida

- public.candidates é a entidade central e deve existir primeiro.
- public.vacancies é independente, mas importante para o módulo de recrutamento e admissões.
- As tabelas de RH dependem diretamente de candidates, portanto precisam ser criadas depois.
- O fluxo de avaliação e documentação é compatível com a criação posterior porque depende de uma linha-base de candidato já existente.
- As tabelas 1:N, como annotations e emergency_contacts, podem ser criadas após a estrutura base sem risco estrutural.

---

## 5. Chaves Primárias

As chaves primárias devem ser definidas conforme abaixo:

| Tabela | PK |
|---|---|
| public.candidates | id |
| public.vacancies | id |
| public.hr_evaluations | id |
| public.hr_annotations | id |
| public.hr_admissions | id |
| public.hr_terminations | id |
| public.hr_documentation | id |
| public.hr_emergency_contacts | id |

### Regras de implementação

- todas as PKs devem usar UUID;
- o valor padrão deve ser gen_random_uuid();
- a criação deve ser explícita para evitar inconsistência entre ambientes.

---

## 6. Foreign Keys

### FKs existentes e recomendadas

| Tabela | Coluna | Referência | Status |
|---|---|---|---|
| public.hr_evaluations.candidate_id | candidate_id | public.candidates.id | Existente |
| public.hr_annotations.candidate_id | candidate_id | public.candidates.id | Existente |
| public.hr_admissions.candidate_id | candidate_id | public.candidates.id | Existente |
| public.hr_terminations.candidate_id | candidate_id | public.candidates.id | Existente |
| public.hr_documentation.candidate_id | candidate_id | public.candidates.id | Existente |
| public.hr_emergency_contacts.candidate_id | candidate_id | public.candidates.id | Existente |

### FKs sugeridas para futuro

As seguintes FKs podem ser criadas futuramente para aumentar a integridade relacional:

- public.hr_admissions.vacancy_id -> public.vacancies.id
- public.hr_admissions.vacancy_id pode ser adaptado para UUID, permitindo relacionamento formal entre admissões e vagas.
- public.hr_evaluations.current_stage pode vir a ser normalizado para uma tabela de etapas, se o processo crescer.
- public.candidates.resume_url e selfie_url podem ser normalizados para uma tabela de arquivos, caso o sistema passe a gerenciar múltiplos anexos com metadados.

### Observação

A relação entre admissões e vagas existe no domínio, mas no estado atual ela é operacional, não relacional. A construção do novo banco pode manter esse modelo atual para preservar compatibilidade.

---

## 7. Índices

### Índices existentes

Os índices observados no modelo atual são principalmente os derivados de:

- PKs;
- UNIQUE em cpf;
- UNIQUE em candidate_id nas tabelas 1:1;
- constraints de integridade.

### Índices recomendados para performance

Sem alterar o sistema atual, os seguintes índices podem ser considerados para o novo ambiente:

- índice em public.candidates.cpf;
- índice em public.candidates.created_at;
- índice em public.hr_evaluations.current_stage;
- índice em public.hr_evaluations.interview_status;
- índice em public.vacancies.status;
- índice em public.vacancies.unit;
- índice em public.vacancies.sector;
- índice em public.hr_admissions.admission_status;
- índice em public.hr_terminations.confirmed;
- índice em public.hr_annotations.created_at.

### Observação de compatibilidade

Os índices devem ser adicionados de forma incremental, sem impactar o funcionamento atual.

---

## 8. Buckets

### 8.1 Bucket selfies

- Nome: selfies
- Objetivo: armazenar fotos de candidatos vinculadas ao cadastro.
- Tipo: público para upload e leitura conforme o fluxo atual.
- Estrutura sugerida de pastas:
  - selfies/{candidate_id}/{filename}
  - ou selfies/{year}/{month}/{candidate_id}/{filename}

### 8.2 Bucket documents

- Nome: documents
- Objetivo: armazenar currículos e demais arquivos relacionados à candidatura.
- Estrutura sugerida de pastas:
  - documents/{candidate_id}/{filename}
  - ou documents/{year}/{month}/{candidate_id}/{filename}

### Regras de acesso

- O storage deve preservar o modelo atual do sistema:
  - upload público para candidatos;
  - leitura autenticada para RH;
  - remoção autenticada por usuários com permissão.
- As políticas devem manter compatibilidade com o fluxo atual do frontend.

---

## 9. Policies RLS

### 9.1 Anon

Políticas para usuários anônimos:

- permitir inscrição pública de candidatos;
- permitir verificação de CPF via RPC;
- permitir leitura de vagas ativas;
- não expor dados sensíveis de candidatos diretamente.

### 9.2 Authenticated

Políticas para usuários autenticados:

- leitura de candidatos e módulos de RH;
- escrita e atualização de avaliações, anotações, admissões, desligamentos, documentação e contatos;
- acesso a arquivos de storage;
- manipulação de vagas.

### 9.3 Service Role

- deve ter acesso completo ao banco e ao storage;
- usado para operações administrativas e importação massiva;
- não deve ser exposto ao frontend.

### 9.4 Storage

- buckets selfies e documents devem ter políticas de upload e leitura compatíveis com o fluxo atual;
- acesso de exclusão deve ser reservado a usuários autenticados com permissão;
- leitura por RH deve ser garantida sem exposição indevida.

---

## 10. Functions

### 10.1 public.candidate_cpf_exists(p_cpf text)

- Entrada: CPF em texto.
- Saída: booleano indicando se o CPF já existe.
- Quem utiliza: formulário público de verificação de CPF.

### 10.2 public.submit_candidate_application(p_payload jsonb)

- Entrada: payload JSON com os dados do formulário público.
- Saída: void.
- Quem utiliza: fluxo de candidatura pública.
- Finalidade: inserir ou atualizar candidato com base em CPF, preservando dados relevantes e evitando duplicidade.

### Observação

Essas funções devem ser criadas após as tabelas principais estarem prontas e antes das policies de uso público.

---

## 11. RPCs

### 11.1 candidate_cpf_exists

Fluxo:

1. o frontend envia o CPF;
2. a função normaliza o valor;
3. a função consulta public.candidates;
4. retorna verdadeiro ou falso.

### 11.2 submit_candidate_application

Fluxo:

1. o formulário público envia um payload JSON;
2. a função valida o CPF;
3. a função verifica se já existe um registro com aquele CPF;
4. se existir, atualiza os dados do candidato;
5. se não existir, insere um novo candidato;
6. a função preserva URLs já existentes quando o payload não as informa.

---

## 12. Variáveis de ambiente

As variáveis abaixo devem existir no ambiente local e de deploy:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

### Regras

- não expor valores;
- manter os valores no ambiente de cada projeto;
- usar o mesmo esquema de nomes no ambiente local e no deploy.

---

## 13. Ordem de importação dos dados

A importação deve seguir esta ordem:

1. public.candidates
2. public.vacancies
3. public.hr_evaluations
4. public.hr_annotations
5. public.hr_documentation
6. public.hr_admissions
7. public.hr_terminations
8. public.hr_emergency_contacts

### Justificativa da ordem

- public.candidates deve vir primeiro porque todas as tabelas de RH dependem desta entidade.
- public.vacancies deve ser importada logo em seguida, pois é a referência operacional para admissões.
- public.hr_evaluations deve vir antes das demais tabelas de workflow porque representa o estado inicial do processo de seleção.
- public.hr_annotations, public.hr_documentation e public.hr_admissions dependem diretamente do candidato e do contexto de RH.
- public.hr_terminations e public.hr_emergency_contacts podem ser importadas depois porque são mais específicas e não precisam preceder outras tabelas.

---

## 14. Plano de rollback

Se algo der errado durante a migração:

1. manter o ambiente antigo ativo;
2. interromper a importação imediatamente;
3. reverter o frontend para a configuração anterior;
4. restaurar o backup do banco, se houver inconsistência crítica;
5. restaurar o backup do storage, se houver erros em arquivos;
6. validar o sistema antigo antes de retomar a migração.

### Critério de acionamento

O rollback deve ser ativado quando:

- houver perda de dados;
- houver falha crítica em políticas RLS;
- houver inconsistência estrutural;
- o frontend não conseguir acessar o novo banco;
- os fluxos públicos ou RH não funcionarem corretamente.

---

## 15. Critérios de aceite

O novo banco pode ser considerado 100% operacional quando:

- todas as tabelas foram criadas corretamente;
- todas as PKs e FKs foram aplicadas;
- as policies RLS estão funcionando;
- os buckets existem e aceitam upload e leitura adequados;
- as funções RPC funcionam para cadastro e verificação de CPF;
- o fluxo público de candidatura funciona;
- o painel RH consegue ler e editar os dados;
- as vagas e admissões operam sem inconsistências;
- os dados importados foram validados por contagem e integridade;
- o deploy aponta para o novo ambiente sem falhas.

---

## 16. Checklist final

### Pré-migração

- [ ] projeto Supabase novo criado
- [ ] authentication configurado
- [ ] storage habilitado
- [ ] buckets criados
- [ ] backup do ambiente atual validado
- [ ] variáveis de ambiente preparadas
- [ ] ambiente local e de deploy alinhados

### Construção do banco

- [ ] tabelas criadas na ordem correta
- [ ] constraints aplicadas
- [ ] FKs aplicadas
- [ ] índices criados
- [ ] functions e RPCs criadas
- [ ] policies RLS aplicadas
- [ ] triggers configurados, se necessários

### Importação e validação

- [ ] dados importados na ordem correta
- [ ] contagens validadas
- [ ] arquivos do storage importados
- [ ] rotas e acesso testados
- [ ] formulário público validado
- [ ] painel RH validado
- [ ] rollback preparado

---

## Resumo executivo

- Complexidade estimada: Alta
- Tempo estimado: 2 a 4 dias, dependendo do volume de dados, do tamanho do storage e da disponibilidade da equipe
- Principais riscos: inconsistência de schema, falhas em RLS, problemas na importação de storage e divergência entre ambiente antigo e novo
- Nível de confiança da migração: 85% para uma execução bem preparada e 70% para uma execução acelerada sem validação completa
