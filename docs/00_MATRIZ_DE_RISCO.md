# Matriz de Riscos da Migração

## Objetivo

Esta matriz consolidada identifica os principais riscos associados à migração do PeopleRH do ambiente Supabase atual para um novo projeto Supabase administrado pelo proprietário do sistema.

## Matriz de Riscos

| ID | Risco | Probabilidade | Impacto | Prioridade | Mitigação |
|---|---|---|---|---|---|
| R-01 | Perda de dados durante exportação/importação de tabelas | Média | Crítico | Alta | Realizar backup completo antes da migração, validar contagens de registros, importar em lotes e comparar dados antes da troca final. |
| R-02 | Inconsistência entre schema do ambiente atual e o novo projeto | Média | Alto | Alta | Aplicar as migrations na ordem correta, validar constraints, defaults e tipos de dados após cada etapa. |
| R-03 | Falha na reprodução das policies RLS no novo ambiente | Média | Alto | Alta | Recriar as policies manualmente com base no schema atual e validar leitura/gravação em ambiente de homologação. |
| R-04 | Incompatibilidade de variáveis de ambiente no frontend | Média | Alto | Alta | Atualizar as variáveis de ambiente no ambiente de build/deploy, testar o app antes da publicação e manter o ambiente antigo como fallback. |
| R-05 | Falha no upload/download de arquivos no storage | Média | Alto | Alta | Validar buckets, paths, permissões e URLs assinadas antes da migração final. |
| R-06 | Problemas na relação lógica entre vagas e admissões | Alta | Médio | Alta | Revisar o fluxo de admissão após a importação e validar a consistência entre vacancies e hr_admissions. |
| R-07 | Erro na ordem de execução das migrations | Média | Médio | Média | Seguir a sequência histórica das migrations e validar cada etapa antes de avançar. |
| R-08 | Divergência de comportamento entre o ambiente antigo e o novo | Média | Médio | Média | Executar testes funcionais completos e comparar resultados entre os ambientes. |
| R-09 | Falha na autenticação e autorização no novo projeto | Média | Alto | Alta | Validar Authentication, anon/authenticated roles e políticas de acesso antes da troca definitiva. |
| R-10 | Atraso operacional durante a janela de migração | Média | Médio | Média | Planejar a execução em janela controlada, com rollback preparado e equipe definida. |
| R-11 | Erro na importação de arquivos de storage com nomes ou paths diferentes | Média | Médio | Média | Preservar a estrutura de paths, documentar os arquivos e validar cada bucket após a importação. |
| R-12 | Inconsistência de dados legados em campos textuais e flags | Alta | Médio | Média | Revisar campos legados como interview_status e interview_attended e validar o comportamento de compatibilidade. |
| R-13 | Falha de rollback em caso de problema pós-troca | Média | Alto | Alta | Manter ambiente antigo operacional, backup disponível e procedimento de reversão documentado. |
| R-14 | Impacto em produção caso a migração seja feita sem validação prévia | Baixa | Crítico | Alta | Realizar validação completa em ambiente de homologação antes da troca final. |
| R-15 | Dificuldade de manutenção futura por ausência de estrutura mais robusta | Média | Médio | Média | Aproveitar a migração para revisar melhorias futuras como índices, FKs formais e auditoria. |

## Observações

- A maior prioridade deve ser dada aos riscos que afetam integridade de dados, segurança e continuidade operacional.
- A migração deve ser conduzida com backup, validação por etapas e rollback preparado.
