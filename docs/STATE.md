# STATE — G.A Essência

## Perfil

TEST:        npm test -- <arquivo> | npm test | npm run build && npm run lint
CONVENÇÕES:  docs/09_CODING_STANDARDS.md, docs/11_PROJECT_RULES.md
ARQUITETURA: domain → repositories/services → features/components
STACK:       TypeScript, React 19, Vite 8, Tailwind 4, Supabase, Vitest, npm
GITFLOW:     production=main | integration=develop | delivery=local-no-ff | remote=local-only
STATE_SCHEMA: 3

## Decisões

### AD-001
- **Decisão**: usar `main` como produção e `develop` como integração local.
- **Razão**: o usuário autorizou explicitamente preparar o Gitflow com uma branch de integração distinta.
- **Trade-off**: `develop` existe apenas localmente até eventual autorização de publicação.
- **Data**: 2026-09-01
- **Status**: ativa

### AD-002
- **Decisão**: tratar as entradas `EPIC/TASK` anteriores ao Bloco 14 como histórico legado e iniciar a execução canônica no Bloco 14.
- **Razão**: o código existente implementa o baseline legado e a documentação aprovada determina que a UX Mobile-first V2 começa no Bloco 14.
- **Trade-off**: o progresso histórico não é convertido retroativamente para checkboxes canônicos.
- **Data**: 2026-09-01
- **Status**: ativa

## Handoff

- **Projeto**: G.A Essência / C:\Users\ARJ\Favorites\Develloper\AgendaGA
- **Bloco atual**: 19 — Exportação de atendimentos para calendário (active)
- **Tasks concluídas neste bloco**: nenhuma
- **Em andamento (arquivo:linha)**: nenhum
- **Próximo passo**: executar PRE-006 e implementar T-077 com download ICS local no navegador
- **Validação**: PRE-006-2 aprovado — `npm test` (14 arquivos, 75 testes), `npm run build` e `npm run lint` passaram; a primeira execução ampla registrou timeout intermitente no teste axe de relatório e a repetição passou; build mantém apenas o aviso conhecido de bundle acima de 500 kB e os testes axe no jsdom registram o aviso de canvas não implementado
- **Tentativas de baseline pré-task**: PRE-006-1 → falhou por timeout de 5 s em `src/tests/reportPage.test.tsx` durante `npm test`; PRE-006-2 → aprovado: `npm test` (14 arquivos, 75 testes), `npm run build` e `npm run lint`
- **Baseline inicial do bloco**: PRE-006-2 aprovado
- **Rebaselines de comando**: nenhum
- **Bloqueios**: nenhum
- **Modo Gitflow**: feature
- **Branch de produção**: main
- **Branch de integração**: develop
- **Branch de trabalho**: feature/bloco-19-calendario
- **Base da branch (SHA)**: 1c74928f81281b953e3b5d953d62b230f8eaf607
- **Último commit de task validado**: nenhum
- **Estado da integração**: active
- **Tip congelado para integração**: nenhum
- **Arquivos dirty esperados**: nenhum
- **Operação Git pendente**: none
- **Push**: não solicitado
- **Motivo da parada**: execução em andamento
