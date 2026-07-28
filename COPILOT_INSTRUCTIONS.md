# PeopleRH - Instruções para IA

## Objetivo

O PeopleRH é um ATS especializado para redes varejistas e supermercados.

Toda alteração deve preservar compatibilidade com produção.

---

## Stack

Frontend:
- React
- TypeScript
- Vite
- Shadcn UI

Backend:
- Supabase

Deploy:
- Vercel

Versionamento:
- GitHub

---

## Regras

Nunca fazer refatorações desnecessárias.

Sempre alterar apenas o que foi solicitado.

Nunca modificar componentes não relacionados.

Nunca alterar o comportamento existente sem necessidade.

Sempre preservar compatibilidade com registros antigos.

Sempre preferir alterações pequenas.

Nunca remover campos antigos sem migração.

Nunca alterar persistência sem analisar impactos.

---

## Banco de Dados

Toda alteração estrutural deve ocorrer por migration.

Nunca alterar diretamente tabelas existentes.

Sempre preservar dados de produção.

---

## Frontend

Preservar layout responsivo.

Não alterar componentes compartilhados sem necessidade.

---

## Kanban

O Kanban representa o pipeline do processo seletivo.

Não utilizar lógica duplicada.

Sempre utilizar current_stage.

---

## ATS

Toda regra de negócio deve refletir o processo real do RH.

Evitar criar campos redundantes.

Sempre privilegiar simplicidade.

---

## Objetivo do projeto

Construir um ATS SaaS profissional especializado em supermercados e varejo.