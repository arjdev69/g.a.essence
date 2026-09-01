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
- **Bloco atual**: 21 — Filtro de pagamento pendente (fiado) em Produtos
- **Tasks do escopo**: TASK-P042 em `docs/26_PRODUCTS_TASKS.md`; filtro de vendas `pending` ou `partial` na listagem/exportação, preservando a UX mobile atual
- **Tasks concluídas neste bloco**: TASK-P042
- **Em andamento (arquivo:linha)**: nenhum
- **Próximo passo**: congelar o tip validado e integrar localmente em `develop` com `merge --no-ff`
- **Validação**: POST-008-2 aprovado — `npm test` (19 arquivos aprovados, 1 arquivo de integração pulado; 151 testes aprovados, 10 pulados), `npm run lint` e `npm run build` passaram; o build mantém apenas o aviso conhecido de bundle acima de 500 kB e os testes registram os avisos de canvas não implementado no jsdom
- **Tentativas de baseline pré-task**: PRE-007-1 → aprovado: `npm test` (14 arquivos, 78 testes), `npm run lint` e `npm run build`
- **Baseline inicial do bloco**: PRE-007-1 aprovado
- **Rebaselines de comando**: nenhum
- **Bloqueios**: nenhum
- **Modo Gitflow**: feature
- **Branch de produção**: main
- **Branch de integração**: develop
- **Branch de trabalho**: feature/pagamento-pendente
- **Base da branch (SHA)**: 0a0cb29f52ae01edce8b3f7e1c3dc7705b40e965
- **Último commit de task validado**: 3ba9b20
- **Estado da integração**: ready-for-merge
- **Tip congelado para integração**: nenhum
- **Arquivos dirty esperados**: nenhum
- **Operação Git pendente**: none
- **Push**: não solicitado
- **Motivo da parada**: filtro implementado e validado; aguardando merge local em `develop`
