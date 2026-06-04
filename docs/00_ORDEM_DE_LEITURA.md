# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 00 — Ordem de leitura e execução

Use estes documentos nesta ordem:

1. `01_PRD.md` — visão de produto, problema, público e MVP.
2. `02_REQUIREMENTS.md` — requisitos funcionais, não funcionais e regras de negócio.
3. `03_SDD.md` — arquitetura, stack, estrutura de pastas e decisões técnicas.
4. `04_SPECIFICATION.md` — especificação por feature, critérios de aceite e regras.
5. `05_DATABASE.md` — schema Supabase/PostgreSQL, índices, constraints e RLS.
6. `06_API_CONTRACTS.md` — contratos dos repositories e DTOs.
7. `07_UX_SPEC.md` — telas, componentes, layout mobile e desktop.
8. `08_TEST_SPEC.md` — testes unitários, de validação e fluxo.
9. `09_CODING_STANDARDS.md` — padrões de código.
10. `10_TASKS.md` — backlog técnico em ordem de execução.
11. `11_PROJECT_RULES.md` — regras permanentes para colar no Codex.

## Fluxo recomendado

Sempre execute uma task por vez:

```txt
Codex, leia 11_PROJECT_RULES.md e implemente apenas a TASK-001 do arquivo 10_TASKS.md.
Consulte os demais documentos quando necessário.
Não implemente nada fora do escopo da task.
```

## Marcos

1. Setup do projeto.
2. Banco/Supabase.
3. Auth.
4. Cadastros.
5. Atendimentos.
6. Dashboard.
7. Relatórios.
8. Exportação CSV.
9. Polimento.
10. Demo.
