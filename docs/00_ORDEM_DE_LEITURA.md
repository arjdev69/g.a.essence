# G.A Essencia

Documentacao para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essencia
Objetivo: sistema de agendamento com calculo automatico da taxa da clinica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 00 - Ordem de leitura e execucao

Use estes documentos nesta ordem:

1. `01_PRD.md` - visao de produto, problema, publico e MVP.
2. `02_REQUIREMENTS.md` - requisitos funcionais, nao funcionais e regras de negocio.
3. `03_SDD.md` - arquitetura, stack, estrutura de pastas e decisoes tecnicas.
4. `04_SPECIFICATION.md` - especificacao por feature, criterios de aceite e regras.
5. `05_DATABASE.md` - schema Supabase/PostgreSQL, indices, constraints e RLS.
6. `06_API_CONTRACTS.md` - contratos dos repositories e DTOs.
7. `07_UX_SPEC.md` - telas, componentes, layout mobile e desktop.
8. `08_TEST_SPEC.md` - testes unitarios, de validacao e fluxo.
9. `09_CODING_STANDARDS.md` - padroes de codigo.
10. `10_TASKS.md` - backlog tecnico em ordem de execucao.
11. `11_PROJECT_RULES.md` - regras permanentes para colar no Codex.
12. `12_FIGMA_LAYOUT.md` - blueprint visual e componentes.
13. `13_FLOW_VALIDATION.md` - validacao dos fluxos principais.
14. `14_CALC_VALIDATION.md` - validacao de calculos e regras financeiras.
15. `15_DEMO.md` - roteiro de demo do produto.
16. `16_CALENDAR_SPRINT.md` - sprint de requisitos para adicionar ao calendario.
17. `17_CALENDAR_IMPLEMENTATION.md` - plano tecnico de implementacao do calendario.

## Fluxo recomendado

Sempre execute uma task por vez:

```txt
Codex, leia 11_PROJECT_RULES.md e implemente apenas a TASK-001 do arquivo 10_TASKS.md.
Consulte os demais documentos quando necessario.
Nao implemente nada fora do escopo da task.
```

## Marcos

1. Setup do projeto.
2. Banco/Supabase.
3. Auth.
4. Cadastros.
5. Atendimentos.
6. Dashboard.
7. Relatorios.
8. Exportacao CSV.
9. Polimento.
10. Demo.
