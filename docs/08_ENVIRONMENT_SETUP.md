# 08. Manual Oficial de Configuração do Ambiente do PeopleRH

## 1. Objetivo

Este documento descreve o processo completo de preparação do ambiente de desenvolvimento e produção do PeopleRH.

Seu objetivo é permitir que qualquer desenvolvedor consiga reconstruir o ambiente do sistema de forma íntegra, sem depender do Lovable e sem depender de uma configuração pré-existente.

O ambiente deve ser administrado de forma independente pelo proprietário do projeto, com controle total sobre:

- repositório GitHub;
- ambiente de desenvolvimento local;
- banco Supabase;
- storage e arquivos;
- deploy Vercel;
- variáveis de ambiente;
- segurança e rollback.

---

## 2. Arquitetura Atual

A arquitetura do PeopleRH é composta pelos seguintes componentes:

```text
VS Code
↓
GitHub
↓
Vercel
↓
Supabase
↓
Frontend React + Vite + TypeScript
↓
Storage
↓
RPCs
↓
Banco PostgreSQL
```

### Resumo funcional

- O desenvolvimento local acontece no VS Code.
- O código-fonte é versionado no GitHub.
- O deploy da aplicação ocorre na Vercel.
- O backend de dados, storage, autenticação e funções SQL ficam no Supabase.
- O frontend é uma aplicação React com Vite e TypeScript.
- O banco é PostgreSQL gerenciado pelo Supabase.
- Arquivos como selfies e documentos são armazenados no storage do Supabase.
- Funções RPCs permitem o fluxo público de candidatura e a validação de CPF.

---

## 3. Pré-requisitos

Antes de começar a configuração, é necessário ter instalado ou disponível o seguinte:

- Git
- Node.js
- npm
- VS Code
- GitHub Desktop (opcional)
- GitHub Copilot
- Supabase CLI
- Vercel CLI (opcional)
- Google Chrome

### Observações

- O ambiente de desenvolvimento pode ser montado em Windows, macOS ou Linux.
- Este documento assume que o usuário tem acesso a uma conta GitHub e a uma conta Supabase.
- O uso do GitHub Desktop é opcional; o fluxo pode ser feito pelo terminal ou pelo GitHub web.

---

## 4. Instalação das Ferramentas

### 4.1 Git

No Windows, o Git pode ser instalado pelo site oficial ou pelo instalador do Git for Windows.

Comandos úteis:

```bash
git --version
```

### 4.2 Node.js e npm

O projeto usa Node.js para rodar o Vite e instalar dependências.

Instalação recomendada:

```bash
node --version
npm --version
```

Se não estiver instalado, instalar o Node.js LTS.

### 4.3 VS Code

Baixar e instalar o Visual Studio Code.

Extensões recomendadas:

- ESLint
- Prettier
- GitLens
- Tailwind CSS IntelliSense
- GitHub Copilot

### 4.4 GitHub Copilot

O acesso ao GitHub Copilot é opcional, mas recomendado para produtividade.

### 4.5 Supabase CLI

Instalação com npm:

```bash
npm install -g supabase
```

Validação:

```bash
supabase --version
```

### 4.6 Vercel CLI

Instalação opcional:

```bash
npm install -g vercel
```

Validação:

```bash
vercel --version
```

### 4.7 Google Chrome

Recomendado para validar o fluxo local e testar o frontend em um navegador moderno.

---

## 5. Estrutura Esperada do Projeto

O repositório do PeopleRH deve ter a seguinte estrutura principal:

```text
src/
  components/
  contexts/
  hooks/
  integrations/
  pages/
  services/
  types/
  utils/

supabase/
  config.toml
  migrations/

public/

docs/

package.json

tailwind.config.ts
	vite.config.ts
	vercel.json
```

### Explicação das pastas

- src/: código-fonte da aplicação frontend.
- src/components/: componentes visuais e blocos de interface.
- src/contexts/: contextos de estado, como vagas.
- src/hooks/: hooks reutilizáveis.
- src/integrations/: integração com serviços externos, como Supabase.
- src/pages/: páginas principais do sistema.
- src/services/: serviços para comunicação com backend.
- src/types/: tipos e interfaces TypeScript.
- src/utils/: utilidades e validações.
- supabase/: estrutura do backend Supabase, incluindo migrations e configuração.
- public/: arquivos estáticos públicos.
- docs/: documentação técnica e operacional.

---

## 6. Variáveis de Ambiente

O projeto depende de variáveis de ambiente tanto para o frontend quanto para a integração com o Supabase.

### Variáveis principais

| Variável | Função |
|---|---|
| VITE_SUPABASE_URL | URL do projeto Supabase usado pelo frontend |
| VITE_SUPABASE_ANON_KEY | Chave pública do projeto Supabase |
| SUPABASE_URL | URL do projeto Supabase em ambientes de build ou execução de scripts |
| SUPABASE_ANON_KEY | Chave pública do projeto Supabase em ambientes de suporte |
| SUPABASE_SERVICE_ROLE_KEY | Chave de serviço, usada apenas em operações administrativas e sensíveis |

### Regras importantes

- Nunca compartilhar valores reais dessas variáveis.
- Nunca deixar valores secretos no código-fonte.
- Configurar as variáveis no ambiente local e no ambiente de deploy.
- Validar se o frontend consegue se conectar corretamente ao projeto Supabase.

---

## 7. Configuração do Supabase

### 7.1 Login

Antes de usar a CLI, o usuário deve fazer login:

```bash
supabase login
```

### 7.2 Link do projeto

Após criar ou acessar o projeto Supabase, o link pode ser feito com o comando:

```bash
supabase link --project-ref <project-ref>
```

### 7.3 Inicialização

Em um projeto local, a inicialização pode ser feita com:

```bash
supabase init
```

### 7.4 Estrutura esperada

A estrutura esperada no repositório inclui:

- supabase/config.toml
- supabase/migrations/
- arquivos de configuração de projeto relacionados ao Supabase

### 7.5 Configuração da CLI

A CLI deve estar configurada com acesso ao projeto correto.

Passos recomendados:

1. Criar ou selecionar o projeto Supabase.
2. Verificar o projeto-ref.
3. Fazer o link com a CLI.
4. Validar que as migrations podem ser aplicadas ou revisadas corretamente.
5. Confirmar que o projeto está acessível via URL e chave pública.

### Observação

A CLI deve ser usada apenas para configuração e apoio operacional. Não é necessário alterar o sistema de forma manual durante a configuração inicial.

---

## 8. Configuração da Vercel

### 8.1 Projeto

O projeto deve ser conectado à Vercel a partir do repositório GitHub.

### 8.2 Build

A Vercel deve receber a aplicação React/Vite corretamente:

- framework: Vite
- build command: definido conforme o projeto
- output directory: definido conforme o projeto

### 8.3 Variáveis

As variáveis de ambiente devem ser configuradas no painel da Vercel:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

### 8.4 Domínio

O projeto pode ter um domínio próprio ou um domínio padrão da Vercel.

### 8.5 Deploy

O deploy pode ser feito manualmente ou automaticamente quando houver push para a branch principal.

### 8.6 Rollback

O rollback pode ser feito:

- revertendo um commit no GitHub;
- reativando uma versão anterior no painel da Vercel;
- restaurando uma configuração anterior de variáveis e deploy.

---

## 9. Configuração do GitHub

### 9.1 Branch principal

O fluxo recomendado é usar a branch main como principal.

### 9.2 Workflow atual

O fluxo padrão esperado é:

1. criar branch para alteração;
2. implementar a mudança localmente;
3. validar localmente;
4. commitar;
5. push para o repositório remoto;
6. abrir pull request, se aplicável;
7. fazer deploy após validação.

### 9.3 Commits

Recomendações:

- usar mensagens claras e objetivas;
- não misturar alterações não relacionadas;
- manter commits pequenos e rastreáveis.

### 9.4 Push

O push deve ser feito para a branch correta e após validação local.

### 9.5 Deploy automático

O deploy automático pode depender da configuração da Vercel e da branch principal.

### 9.6 Boas práticas

- manter o repositório limpo;
- não publicar segredos;
- revisar alterações antes do merge;
- preservar compatibilidade com produção.

---

## 10. Fluxo Oficial de Desenvolvimento

O fluxo adotado para o PeopleRH pode ser descrito assim:

```text
Alteração
↓
Teste Local
↓
Commit
↓
Push
↓
Deploy Vercel
↓
Validação
↓
Produção
```

### Passos detalhados

1. Fazer alteração localmente no VS Code.
2. Rodar o projeto localmente para validar comportamento.
3. Verificar se há erros de build ou lint.
4. Realizar commit com mensagem clara.
5. Enviar para o GitHub.
6. Fazer deploy via Vercel.
7. Validar o funcionamento em ambiente de produção.

---

## 11. Como Executar Localmente

### 11.1 Clonar o projeto

```bash
git clone <url-do-repositorio>
cd peoplehr
```

### 11.2 Instalar dependências

```bash
npm install
```

### 11.3 Configurar variáveis de ambiente

Criar ou ajustar o arquivo de ambiente local com as variáveis necessárias.

### 11.4 Rodar o projeto

```bash
npm run dev
```

### 11.5 Acessar localmente

O projeto deve ficar disponível em um endereço local semelhante a:

```text
http://localhost:5173
```

### 11.6 Validar funcionamento

Validar:

- carregamento da página inicial;
- cadastro público;
- leitura de vagas;
- acesso ao painel RH;
- upload e leitura de arquivos de storage;
- conexão com Supabase.

---

## 12. Como Gerar Build

### 12.1 Executar build

```bash
npm run build
```

### 12.2 Validar build

Após o build, verificar:

- ausência de erros de compilação;
- ausência de erros de tipagem;
- se o output gerado está correto;
- se o projeto consegue ser servido.

### 12.3 Interpretar erros

Problemas comuns incluem:

- variáveis ausentes;
- dependências não instaladas;
- problemas de importação;
- erros de configuração do Vite;
- incompatibilidade de tipos.

---

## 13. Checklist de Configuração

### Checklist operacional

- [ ] Git instalado
- [ ] Node instalado
- [ ] npm instalado
- [ ] VS Code instalado
- [ ] GitHub Copilot instalado
- [ ] Projeto clonado
- [ ] Dependências instaladas
- [ ] Variáveis configuradas
- [ ] Supabase conectado
- [ ] Vercel configurada
- [ ] Projeto executando localmente
- [ ] Deploy funcionando

---

## 14. Troubleshooting

| Problema | Sintoma | Possível causa | Como resolver |
|---|---|---|---|
| Git não encontrado | comando git não funciona | Git não instalado ou não no PATH | instalar Git e reiniciar o terminal |
| npm não encontrado | comando npm não funciona | Node.js não instalado | instalar Node.js LTS |
| Erro de Build | npm run build falha | dependências ausentes ou variáveis inválidas | rodar npm install e validar variáveis |
| Erro de Variáveis | aplicação não conecta corretamente | variáveis faltando ou incorretas | revisar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY |
| Erro Supabase | falha de conexão ou login | projeto não configurado ou token inválido | validar login e link do projeto |
| Erro Storage | upload ou leitura de arquivos falha | bucket inexistente ou política RLS incorreta | revisar buckets e políticas no Supabase |
| Erro Vercel | deploy falha | build inválido ou ambiente incorreto | validar build local e variáveis na Vercel |
| Erro CORS | requisição falha | políticas de segurança ou domínio incorreto | revisar configuração de domínio e acesso do projeto |
| Erro Signed URL | arquivo não abre | políticas de storage ou URL assinado incorreto | revisar políticas de leitura e geração de URL |
| Erro Migration | estrutura do banco não corresponde | migration incompleta ou aplicada na ordem errada | revisar ordem das migrations e backup |
| Erro de Deploy | aplicação não atualiza | deploy automático ou build com falha | revisar logs da Vercel e reverter se necessário |

---

## 15. Rollback

Em caso de problemas, o rollback pode ser realizado de forma organizada.

### Rollback com GitHub

1. Identificar o último commit estável.
2. Reverter o commit problemático.
3. Fazer push da correção.
4. Validar o ambiente novamente.

### Rollback com Vercel

1. Acessar o painel da Vercel.
2. Selecionar uma versão anterior de deploy.
3. Reativar o deploy estável.
4. Validar que o sistema voltou a funcionar.

### Rollback de banco e storage

Se a falha envolver dados ou estrutura:

1. parar a migração ou importação;
2. restaurar backup do banco, se disponível;
3. restaurar backup do storage;
4. validar a recuperação antes de retomar a operação.

---

## 16. Boas Práticas

### Commits

- usar mensagens claras;
- não misturar assuntos diferentes em um mesmo commit;
- preservar compatibilidade com produção.

### Branches

- usar branches específicas por tarefa;
- manter a branch main estável;
- revisar alterações antes do merge.

### Migrations

- aplicar migrations em ordem correta;
- preservar dados existentes;
- nunca alterar diretamente tabelas em produção;
- validar impacto antes de alterar schema.

### Deploy

- validar build antes do deploy;
- revisar variáveis de ambiente;
- manter rollback preparado.

### Testes

- validar fluxo local antes de publicar;
- testar cadastro público e painel RH;
- validar storage e upload de arquivos.

### Banco de Dados

- manter backups atualizados;
- documentar alterações de estrutura;
- evitar alterações destrutivas sem planejamento.

### Storage

- preservar estrutura de arquivos;
- manter políticas de segurança claras;
- validar acessos depois de qualquer mudança.

### Segurança

- não expor chaves em repositórios;
- usar permissões mínimas;
- controlar acesso ao Supabase e à Vercel;
- revisar logs e acessos regularmente.

---

## 17. Próximos Passos

Após a configuração completa do ambiente, o próximo passo será executar o Plano Oficial de Migração do Banco de Dados, descrito no documento 09.

A configuração completa do ambiente é um pré-requisito para garantir que a migração do banco, a validação do sistema e o deploy sejam realizados com segurança e confiabilidade.

---

## Resumo Executivo

- Seções criadas: 17
- Checklists: 1
- Tabelas: 1
- Alterações no código-fonte: nenhuma
