# 05. Arquitetura Funcional do PeopleRH

Este documento representa a arquitetura funcional oficial do PeopleRH, descrevendo o produto como um sistema completo de ATS para RH e operações de contratação em ambientes varejistas e supermercadistas.

Ele foi elaborado com base no estado atual do sistema, nas regras de negócio observadas e nos fluxos implementados, mas descreve a proposta funcional do produto de forma independente da implementação técnica atual.

---

## 1. Visão Geral do Produto

### Propósito do PeopleRH

O PeopleRH é uma plataforma de recrutamento e gestão de pessoas voltada para organizações que precisam controlar processo seletivo, movimentação de vagas, contratação, documentação e desligamento de colaboradores em ambiente operacional e com alta velocidade de decisão.

### Problema que resolve

O produto resolve a dificuldade de:

- centralizar candidaturas em um único canal;
- organizar a triagem de candidatos de forma visual e operacional;
- acompanhar o andamento do processo seletivo;
- controlar vagas abertas e ocupação;
- manter o fluxo documental e de admissão sob controle;
- preservar histórico e evidências de decisão do RH.

### Público-alvo

O público principal é composto por:

- empresas de varejo e supermercados;
- equipes de RH;
- gestores de unidade;
- diretoria e liderança operacional;
- candidatos ao processo seletivo.

### Diferenciais

- foco em varejo e operação comercial;
- fluxo de recrutamento alinhado ao processo real de contratação;
- integração entre triagem, avaliação, contratação e desligamento;
- visão operacional por vaga, unidade, setor e turno;
- controle documental e de admissão em um único ambiente.

---

## 2. Objetivos do Produto

### Objetivos de negócio

- acelerar a contratação de pessoas qualificadas;
- reduzir o tempo de triagem e decisão;
- aumentar a rastreabilidade do processo seletivo;
- melhorar a visibilidade de vagas e capacidade operacional;
- padronizar o fluxo de RH entre áreas e unidades.

### Objetivos operacionais

- centralizar todo o processo de candidatura;
- permitir acompanhamento diário da equipe RH;
- reduzir retrabalho entre triagem, entrevista e contratação;
- dar visibilidade ao gestor sobre candidatos em análise;
- garantir que documentação e admissão sejam tratadas de forma consistente.

### Objetivos técnicos

- manter um modelo de dados estável e sustentável;
- oferecer integração entre frontend, banco e storage;
- garantir segurança e rastreabilidade de dados;
- permitir evolução de módulos sem quebra funcional.

### Objetivos futuros

- transformar o sistema em uma plataforma completa de gestão de pessoas;
- integrar recrutamento, onboarding, folha, ponto e treinamentos;
- ampliar a automação e análise de dados.

---

## 3. Personas

### Administrador

#### Responsabilidades

- gerenciar a estrutura geral do sistema;
- supervisionar permissões, dados e configurações;
- acompanhar o funcionamento global do produto.

#### Objetivos

- garantir estabilidade e consistência do fluxo operacional.

#### Permissões

- acesso completo ao sistema;
- possibilidade de gerenciar módulos e configurações.

#### Funcionalidades utilizadas

- painel geral;
- gestão de vagas;
- relatórios executivos;
- configuração de permissões.

### RH

#### Responsabilidades

- receber e analisar candidatos;
- registrar avaliações, anotações e movimentações;
- acompanhar documentação, admissão e desligamento.

#### Objetivos

- selecionar os melhores candidatos de forma eficiente e consistente.

#### Permissões

- leitura e escrita nas principais entidades do processo seletivo.

#### Funcionalidades utilizadas

- cadastro e edição de candidatos;
- kanban;
- avaliações;
- anotações;
- documentação;
- admissões;
- desligamentos.

### Gestor da Loja

#### Responsabilidades

- acompanhar candidatos vinculados às vagas de sua unidade;
- validar propostas e decisões de contratação;
- participar do processo de aprovação.

#### Objetivos

- garantir que a contratação atenda às necessidades da operação.

#### Permissões

- visualização parcial dos candidatos e vagas;
- aprovação de etapas específicas.

#### Funcionalidades utilizadas

- painel operacional;
- validação de proposta;
- acompanhamento de candidatos por vaga/unidade.

### Diretor

#### Responsabilidades

- avaliar o desempenho estratégico do processo seletivo;
- acompanhar indicadores de contratação e demanda.

#### Objetivos

- reduzir tempo de contratação e melhorar qualidade das contratações.

#### Permissões

- leitura consolidada e visão executiva.

#### Funcionalidades utilizadas

- dashboard executivo;
- relatórios de contratação;
- visão geral do pipeline.

### Candidato

#### Responsabilidades

- realizar cadastro;
- informar seus dados e documentos;
- acompanhar o andamento do processo seletivo.

#### Objetivos

- participar de oportunidades de emprego e avançar no processo.

#### Permissões

- acesso ao formulário público e visualização limitada de seu próprio estado.

#### Funcionalidades utilizadas

- cadastro público;
- upload de documentos e foto;
- consulta de status inicial do processo.

---

## 4. Módulos do Sistema

### Portal do Candidato

Responsável por receber o cadastro público do candidato, coletar dados, anexos e consentimentos e iniciar o processo seletivo.

### Painel RH

Responsável por centralizar a análise do candidato, registrar avaliações, movimentações e dados operacionais de RH.

### Kanban

Responsável por representar visualmente o pipeline do processo seletivo e permitir movimentação entre etapas.

### Gestão de Vagas

Responsável por manter o cadastro de vagas, controle de quantidade, status, unidade, setor, turno e consumo por admissão.

### Documentação

Responsável por controlar a entrega e validação dos documentos necessários para cada etapa do processo.

### Admissão

Responsável por registrar o aceite da vaga, as condições contratuais e o vínculo do candidato com a posição.

### Desligamento

Responsável por registrar o encerramento de vínculo com a organização, motivos, data e regras de recontratação.

### Relatórios

Responsável por consolidar indicadores de processo seletivo, admissão, desligamento e vagas.

### Dashboard

Responsável por fornecer visão operacional e executiva sobre o status do recrutamento e da força de trabalho.

### Banco de Talentos

Responsável por conservar candidatos que foram avaliados como potenciais para futuras oportunidades.

### Anotações

Responsável por armazenar observações internas e contexto operacional para apoiar a decisão do RH.

---

## 5. Fluxo Geral do Produto

```text
Candidato
↓
Cadastro
↓
Triagem
↓
Entrevista
↓
Validação do Gestor
↓
Proposta
↓
Aceite
↓
Documentação
↓
Contratação
↓
Admissão
↓
Funcionário
↓
Desligamento
```

Esse fluxo representa o ciclo completo de relacionamento do candidato com o sistema, desde a entrada até a saída da organização.

---

## 6. Fluxo do Candidato

A jornada do candidato começa no cadastro público, onde ele insere dados pessoais, sensibilidades operacionais, experiência, expectativas e arquivos.

### Etapas principais

1. Acesso ao formulário público
2. Preenchimento de dados cadastrais
3. Upload de arquivos e foto
4. Submissão da candidatura
5. Recebimento do status inicial do processo
6. Avanço para triagem e entrevista
7. Recebimento de feedback operacional
8. Possível contratação e admissão

### Objetivo do fluxo

Permitir que o candidato entre no processo seletivo, seja avaliado e, se aprovado, evolua para contrato e vínculo organizacional.

---

## 7. Fluxo do RH

O RH é o centro operacional do sistema e conduz a maior parte do processo.

### Etapas do fluxo

#### Cadastro

- registrar candidato no sistema;
- validar dados básicos e documentos;
- manter histórico de atualização.

#### Triagem

- revisar os dados do candidato;
- analisar perfil, formação, experiência e aspiração;
- decidir se o candidato segue para entrevista.

#### Entrevista

- registrar presença, status e observações;
- avaliar se o candidato está alinhado com a vaga.

#### Movimentação

- atualizar estágio do processo;
- mover o candidato entre fases do pipeline;
- registrar decisões operacionais.

#### Contratação

- vincular o candidato a uma vaga;
- controlar documentação;
- registrar admissão.

#### Desligamento

- registrar término de vínculo;
- manter histórico e observações;
- reabrir ou recolocar a vaga quando necessário.

---

## 8. Fluxo do Gestor

O gestor participa do processo principalmente nas etapas de validação e de contratação.

### Papel do gestor

- avaliar se o candidato atende à necessidade da unidade;
- validar possibilidade de contratação;
- aprovar ou não a proposta;
- acompanhar status da vaga e do candidato.

### Valor entregue

Permite que decisões importantes sejam tomadas sem depender apenas do RH, alinhando o processo com a operação de cada unidade.

---

## 9. Pipeline Operacional

O pipeline operacional aprovado do PeopleRH é o seguinte:

```text
Triagem
↓
Entrevista
↓
Validação do Gestor
↓
Proposta
↓
Aceite
↓
Documentação
↓
Contratação
```

### Explicação das etapas

- Triagem: avaliação inicial da candidatura.
- Entrevista: etapa de validação comportamental e operacional.
- Validação do Gestor: análise da necessidade da unidade.
- Proposta: comunicação da oportunidade à pessoa candidata.
- Aceite: confirmação pelo candidato.
- Documentação: entrega e checagem de documentos.
- Contratação: formalização da admissão.

---

## 10. Eventos Operacionais

Eventos operacionais são eventos que não alteram a posição principal do candidato no pipeline, mas agregam contexto, controle ou informação ao processo.

### Exemplos

- Entrevista agendada
- Compareceu
- Não compareceu
- Reagendada
- Cancelada
- Banco de Talentos
- NS
- PCD
- Anotações
- Observações

### Característica principal

Esses eventos complementam o pipeline, mas não substituem a lógica do processo principal.

---

## 11. Pipeline Ativo

O pipeline ativo representa o conjunto de candidatos que ainda estão em andamento no processo seletivo.

### Critérios de inclusão

- candidatura submetida;
- avaliação não encerrada;
- processo não finalizado em admissão ou desligamento.

### Objetivo

Manter a operação RH alinhada com as oportunidades abertas e com as decisões pendentes.

---

## 12. Pipeline Encerrado

O pipeline encerrado representa candidatos cujo processo foi concluído, seja por contratação, desistência, reprovação ou encerramento operacional.

### Critérios de inclusão

- contratação concluída;
- reprovação final;
- desistência;
- não comparecimento e encerramento sem continuidade;
- entrada em banco de talentos quando não há continuidade imediata.

### Objetivo

Preservar histórico e evitar que casos encerrados voltem ao fluxo ativo sem decisão explícita.

---

## 13. Kanban

### Objetivo

Representar visualmente o andamento do processo seletivo e permitir movimentação de candidatos entre etapas.

### Estrutura

O kanban organiza os candidatos por estágio do pipeline, permitindo uma leitura rápida do estado de cada processo.

### Colunas sugeridas

- Triagem
- Entrevista
- Validação Gestor
- Proposta
- Aceite
- Documentação
- Contratação

### Cards

Cada card representa um candidato e pode conter:

- nome;
- vaga vinculada;
- status;
- observações;
- anotações RH;
- dados de entrevista.

### Movimentações

As movimentações ocorrem quando o candidato avança ou retorna em uma etapa, de acordo com a regra operacional.

### Regras

- uma movimentação deve refletir uma decisão real do processo;
- o sistema deve preservar histórico da etapa anterior;
- o fluxo deve favorecer rastreabilidade.

### KPIs derivados

- tempo médio de triagem;
- tempo médio entre etapas;
- taxa de conversão por estágio;
- taxa de contratação por vaga.

---

## 14. Dashboard

O dashboard é o painel de gestão do produto, reunindo indicadores que auxiliam RH, gestão e diretoria.

### Indicadores operacionais

- candidatos em análise;
- candidatos por etapa;
- vagas abertas;
- vagas ocupadas;
- candidatos contratados;
- candidatos em documentação;
- candidatos em banco de talentos.

### Indicadores de gestão

- tempo médio de contratação;
- volume por unidade;
- volume por setor;
- taxa de conversão por etapa;
- taxa de desligamento.

### Indicadores executivos

- número total de contratações;
- desempenho por região/unidade;
- fluxo de vagas e ocupação;
- tendência de contratação por período.

---

## 15. Relatórios

Os relatórios têm a função de consolidar a operação e apoiar decisões estratégicas.

### Relatórios previstos

- relatório de vagas;
- relatório de candidatos por etapa;
- relatório de admissões;
- relatório de desligamentos;
- relatório documental;
- relatório de entrevistas;
- relatório executivo de contratação.

### Finalidade

Fornecer visão consolidada para RH, gestão e diretoria.

---

## 16. Gestão de Vagas

A gestão de vagas é um módulo central do produto.

### Criação

- registrar vaga com nome, unidade, turno, setor, tipo e quantidade.

### Edição

- ajustar número de posições, status, observações e detalhes operacionais.

### Fechamento

- encerrar vagas obsoletas ou sem demanda.

### Saldo

- controlar posições disponíveis e ocupadas.

### Ocupação

- rastrear contratações realizadas e vagas preenchidas.

### Contratação

- associar candidato aprovado à vaga.

### Desligamento

- liberar a vaga e reintegrar saldo ao fluxo operacional.

---

## 17. Banco de Talentos

O banco de talentos é um repositório funcional de candidatos que passaram por avaliação, mas não foram contratados no momento.

### Funcionamento

- candidatos que não foram contratados podem ser mantidos para futuras oportunidades;
- o sistema permite que o RH recupere esses perfis rapidamente;
- a seleção futura pode usar esse histórico como base.

### Critérios

- avaliação positiva, mas sem contratação imediata;
- perfil alinhado com futuras necessidades;
- candidato com potencial para reabertura do processo.

### Regras

- deve haver clareza entre candidato ativo e candidato em banco de talentos;
- não deve ser confundido com processo ativo de contratação.

---

## 18. Regras de Negócio

### Regras identificadas

- um candidato pode ter uma avaliação por processo principal;
- um candidato pode ter uma admissão por processo de contratação;
- um candidato pode ter uma documentação associada por processo;
- uma vaga pode ter múltiplos candidatos em análise, mas uma contratação por posição em cada etapa;
- a movimentação do candidato deve respeitar o pipeline operacional;
- eventos operacionais não substituem a etapa principal do processo;
- status e etapas devem ser interpretados de forma consistente pela equipe RH;
- a gestão de vagas deve refletir o estado real de contratação e desligamento.

### Restrições

- não deve haver duplicidade indevida de registros de admissão;
- não deve haver inconsistência entre status da vaga e status do candidato;
- o processo deve preservar histórico de decisões.

---

## 19. Requisitos Não Funcionais

### Performance

- a plataforma deve responder rapidamente em consultas de candidatos, vagas e relatórios;
- operações de leitura e escrita devem ser adequadas ao volume diário esperado.

### Segurança

- dados pessoais e sensíveis devem ser protegidos;
- o acesso deve ficar restrito conforme perfil e função;
- o sistema deve respeitar regras de LGPD e proteção de informação.

### Disponibilidade

- o sistema deve estar acessível para RH, gestores e candidatos;
- falhas pontuais não devem comprometer o rastreamento do processo seletivo.

### Auditabilidade

- alterações importantes devem ser rastreáveis;
- decisões de processo devem ser preservadas em histórico.

### Escalabilidade

- a arquitetura deve suportar aumento de candidatos, vagas e unidades.

### Manutenibilidade

- o produto deve permitir evolução sem reescrever todo o fluxo operacional a cada mudança.

---

## 20. Roadmap Funcional

### Curto prazo

- consolidar o pipeline operacional atual;
- refinamento do fluxo de documentação e contratação;
- melhorar gestão de vagas e saldo operacional;
- ampliar consistência entre RH e gestor.

### Médio prazo

- ampliar relatórios e indicadores;
- melhorar banco de talentos e reabertura de processos;
- evoluir o painel executivo;
- formalizar integração entre processos de recrutamento e gestão de pessoas.

### Longo prazo

- expandir para onboarding, folha, ponto e treinamentos;
- introduzir automação e inteligência operacional;
- integrar canais como WhatsApp e e-mail transacional;
- evoluir para uma plataforma completa de gestão humana.

---

## 21. Funcionalidades Futuras

As funcionalidades abaixo são compatíveis com o posicionamento futuro do PeopleRH:

- agenda de entrevistas;
- notificações automáticas;
- WhatsApp para comunicação com candidatos;
- portal do gestor;
- treinamentos e capacitação;
- avaliações de desempenho;
- gamificação de processos;
- indicadores inteligentes com análise de dados;
- IA para triagem e classificação de candidatos;
- integração com folha de pagamento;
- integração com ponto eletrônico;
- reforço de compliance e LGPD.

---

## 22. Conclusão

O PeopleRH já apresenta um nível funcional maduro para um ATS voltado a recrutamento e operações de RH, especialmente em contextos de varejo e supermercados. O produto tem boa coerência de negócio, com fluxo claro de candidatura, avaliação, contratação e desligamento, além de uma forte proposta operacional para RH e gestão.

### Nível de maturidade funcional

O produto está em um estágio funcional intermediário a avançado, com boa cobertura do ciclo principal de contratação, mas ainda com espaço para evolução em governança, automação e integração.

### Diferenciais

- foco vertical em varejo e operação;
- modelo de processo alinhado à realidade do RH;
- cobertura de recrutamento, vaga, admissão e desligamento em um mesmo ambiente;
- boa base para expansão comercial e operacional.

### Potencial comercial

O potencial comercial é elevado, principalmente para empresas que precisam de controle claro de contratação e operação de pessoas em múltiplas unidades.

### Módulos que merecem prioridade

- gestão de vagas;
- pipeline e kanban;
- relatórios e dashboard;
- documentação e admissão;
- banco de talentos.

---

## Documentos utilizados

- [COPILOT_INSTRUCTIONS.md](COPILOT_INSTRUCTIONS.md)
- [docs/01_BACKEND_INVENTORY.md](docs/01_BACKEND_INVENTORY.md)
- [docs/02_BACKEND_ARCHITECTURE.md](docs/02_BACKEND_ARCHITECTURE.md)
- [docs/03_DATABASE_SCHEMA.md](docs/03_DATABASE_SCHEMA.md)
- [docs/04_MIGRATION_PLAN.md](docs/04_MIGRATION_PLAN.md)

## Módulos identificados

- Portal do Candidato
- Painel RH
- Kanban
- Gestão de Vagas
- Documentação
- Admissão
- Desligamento
- Relatórios
- Dashboard
- Banco de Talentos
- Anotações

## Fluxos identificados

- fluxo geral do candidato até contratação e desligamento
- fluxo de RH
- fluxo do gestor
- pipeline operacional
- pipeline ativo e encerrado

## Regras de negócio identificadas

- uma avaliação por candidato no processo principal
- uma admissão por candidato por ciclo de contratação
- uma documentação associada por candidato
- regras de movimentação do pipeline
- regras de relacionamento entre vagas e admissão
- regras de banco de talentos e encerramento do processo
