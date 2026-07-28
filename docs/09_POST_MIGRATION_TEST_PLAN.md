# 1. Objetivo

Este documento garante que o novo ambiente do PeopleRH esteja operacional antes do desligamento definitivo do ambiente Lovable.

Ele define um plano completo de validação funcional após a migração para um novo projeto Supabase, com foco em:

- integridade do banco;
- funcionamento do portal do candidato;
- funcionamento do painel de RH;
- funcionamento das vagas;
- funcionamento do storage;
- performance;
- segurança.

---

# 2. Validação do Banco

Checklist de validação do banco:

- [ ] quantidade de tabelas
- [ ] quantidade de registros
- [ ] constraints
- [ ] foreign keys
- [ ] indexes
- [ ] funções SQL
- [ ] RPCs
- [ ] RLS
- [ ] buckets
- [ ] policies

### Validações esperadas

- O número de tabelas deve corresponder ao modelo esperado.
- A quantidade de registros deve ser compatível com a migração realizada.
- As constraints devem estar ativas e sem inconsistências.
- As foreign keys devem estar corretamente definidas.
- Os indexes devem existir e não comprometer o funcionamento.
- As funções SQL devem executar sem erro.
- As RPCs devem responder corretamente para os fluxos públicos e internos.
- O RLS deve proteger os dados conforme o esperado.
- Os buckets devem existir e estar acessíveis.
- As policies devem permitir o uso correto do sistema sem exposição indevida.

---

# 3. Testes do Portal do Candidato

Checklist do portal do candidato:

- [ ] consulta CPF
- [ ] cadastro novo
- [ ] atualização
- [ ] upload selfie
- [ ] upload currículo
- [ ] upload documentos
- [ ] envio candidatura
- [ ] gravação no banco

### Validações esperadas

- A consulta de CPF deve identificar corretamente candidatos existentes.
- O cadastro novo deve gravar os dados corretamente.
- A atualização deve preservar os dados já existentes sem duplicar registros.
- O upload de selfie deve funcionar e gerar referência válida no banco.
- O upload de currículo deve funcionar corretamente.
- O upload de documentos deve funcionar corretamente.
- O envio da candidatura deve concluir o fluxo sem falhas.
- Os dados devem ser gravados corretamente no banco do novo projeto Supabase.

---

# 4. Testes do RH

Checklist do módulo de RH:

- [ ] login
- [ ] dashboard
- [ ] lista candidatos
- [ ] filtros
- [ ] ordenação
- [ ] abertura da ficha
- [ ] anotações
- [ ] documentação
- [ ] admissão
- [ ] desligamento
- [ ] banco de talentos
- [ ] NS
- [ ] PCD
- [ ] Kanban
- [ ] relatórios

### Validações esperadas

- O login do RH deve funcionar corretamente.
- O dashboard deve carregar as informações esperadas.
- A lista de candidatos deve exibir os registros corretamente.
- Os filtros devem retornar os resultados esperados.
- A ordenação deve funcionar consistentemente.
- A ficha do candidato deve abrir sem erro.
- As anotações devem ser salvas e exibidas corretamente.
- A documentação deve ser registrada e consultada corretamente.
- A admissão deve funcionar sem inconsistências.
- O desligamento deve funcionar sem quebrar a lógica de vaga.
- O banco de talentos deve ser corretamente representado.
- Os campos NS e PCD devem estar consistentes.
- O Kanban deve refletir o estágio atual do processo.
- Os relatórios devem exibir os dados corretos.

---

# 5. Testes das Vagas

Checklist do módulo de vagas:

- [ ] criar vaga
- [ ] editar
- [ ] excluir
- [ ] contratar
- [ ] desligar
- [ ] quantidade disponível
- [ ] quantidade ocupada

### Validações esperadas

- A criação de vagas deve funcionar corretamente.
- A edição deve atualizar os dados sem perder informações.
- A exclusão deve respeitar dependências e regras de negócio.
- A contratação deve reduzir a quantidade disponível e aumentar a ocupada.
- O desligamento deve restaurar a quantidade disponível, quando aplicável.
- A quantidade disponível deve refletir o estado real da vaga.
- A quantidade ocupada deve refletir a quantidade efetivamente contratada.

---

# 6. Testes do Storage

Checklist do storage:

- [ ] bucket selfies
- [ ] bucket documents
- [ ] signed urls
- [ ] download
- [ ] upload
- [ ] exclusão

### Validações esperadas

- O bucket selfies deve estar acessível e receber arquivos corretamente.
- O bucket documents deve estar acessível e receber arquivos corretamente.
- As signed URLs devem funcionar para leitura segura.
- O download deve funcionar sem falhas.
- O upload deve gravar os arquivos corretamente.
- A exclusão deve remover os arquivos quando necessário.

---

# 7. Testes de Performance

Checklist de performance:

- [ ] tempo de carregamento
- [ ] tempo de gravação
- [ ] tempo de upload
- [ ] tempo de busca
- [ ] tempo do dashboard

### Validações esperadas

- O carregamento das páginas deve ocorrer dentro de limites aceitáveis.
- As gravações no banco devem responder sem lentidão excessiva.
- Os uploads devem ser concluídos sem travamentos.
- As buscas devem retornar resultados em tempo adequado.
- O dashboard deve carregar com desempenho satisfatório.

---

# 8. Testes de Segurança

Checklist de segurança:

- [ ] RLS
- [ ] anon
- [ ] authenticated
- [ ] policies
- [ ] storage

### Validações esperadas

- O RLS deve proteger os dados corretamente.
- O papel anon deve ter apenas os acessos públicos necessários.
- O papel authenticated deve ter os acessos internos esperados.
- As policies devem restringir ou permitir acesso conforme o fluxo do sistema.
- O storage deve proteger arquivos e evitar exposição indevida.

---

# 9. Critérios para Aprovação

| Item | Resultado | Observações | Status |
|---|---|---|---|
| Banco |  |  |  |
| Portal do Candidato |  |  |  |
| RH |  |  |  |
| Vagas |  |  |  |
| Storage |  |  |  |
| Performance |  |  |  |
| Segurança |  |  |  |

### Critério de aprovação

A validação será considerada aprovada somente se todos os itens forem avaliados como funcionais e sem inconsistências críticas.

---

# 10. Critério Go Live

Somente após 100% dos testes aprovados será permitido:

- alterar as variáveis de ambiente da Vercel;
- publicar a nova versão;
- desativar definitivamente o ambiente Lovable.

Essa decisão deve ocorrer apenas após a validação completa de banco, fluxo de candidatura, painel RH, vagas, storage, performance e segurança.
