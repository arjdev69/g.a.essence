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
- **Bloco atual**: 19 — Exportação de atendimentos para calendário (concluído; ready-for-merge)
- **Tasks concluídas neste bloco**: T-077, T-078, T-079
- **Em andamento (arquivo:linha)**: nenhum
- **Próximo passo**: congelar a ponta e integrar o Bloco 19 em `develop` com merge local `--no-ff`
- **Validação**: POST-006 aprovado — `npm test` (14 arquivos, 78 testes), `npm run build` e `npm run lint` passaram; axe não apontou violações critical/serious no escopo; contrato e fluxo cobrem download local, sucesso, erro recuperável, dados incompletos e variantes desktop/mobile; build mantém apenas o aviso conhecido de bundle acima de 500 kB e os testes axe no jsdom registram o aviso de canvas não implementado
- **Tentativas de baseline pré-task**: PRE-006-1 → falhou por timeout de 5 s em `src/tests/reportPage.test.tsx` durante `npm test`; PRE-006-2 → aprovado: `npm test` (14 arquivos, 75 testes), `npm run build` e `npm run lint`
- **Baseline inicial do bloco**: PRE-006-2 aprovado
- **Rebaselines de comando**: nenhum
- **Bloqueios**: nenhum
- **Modo Gitflow**: feature
- **Branch de produção**: main
- **Branch de integração**: develop
- **Branch de trabalho**: feature/bloco-19-calendario
- **Base da branch (SHA)**: 1c74928f81281b953e3b5d953d62b230f8eaf607
- **Último commit de task validado**: 3ef73b6
- **Estado da integração**: ready-for-merge
- **Tip congelado para integração**: ponta deste commit de estado, registrada no histórico após o commit
- **Arquivos dirty esperados**: nenhum
- **Operação Git pendente**: none
- **Push**: não solicitado
- **Motivo da parada**: bloco concluído e pronto para integração local
