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
- **Bloco atual**: 15 — Navegação mobile sem sobreposição (concluído; ready-for-merge)
- **Tasks concluídas neste bloco**: T-066, T-067
- **Em andamento (arquivo:linha)**: nenhum
- **Próximo passo**: congelar a ponta e integrar o Bloco 15 em `develop` com merge local `--no-ff`
- **Validação**: POST-002 aprovado — `npm test` (8 arquivos, 51 testes), `npm run build` e `npm run lint` passaram; build mantém apenas o aviso conhecido de bundle acima de 500 kB; navegador local alcançou `/login` e a interação autenticada foi validada no DOM com jsdom
- **Tentativas de baseline pré-task**: PRE-002 → 8ba9e95a4354e0df3ef2ad9523ae85a068d1919e → `npm test`; `npm run build`; `npm run lint` → aprovado: 7 arquivos/48 testes, build e lint sem erros
- **Baseline inicial do bloco**: PRE-002 aprovado
- **Rebaselines de comando**: nenhum
- **Bloqueios**: nenhum
- **Modo Gitflow**: feature
- **Branch de produção**: main
- **Branch de integração**: develop
- **Branch de trabalho**: feature/bloco-15-navegacao-mobile
- **Base da branch (SHA)**: 8ba9e95a4354e0df3ef2ad9523ae85a068d1919e
- **Último commit de task validado**: d1ad53fb6d375a9c1b2ac49c0fd0660ea7f80f2b
- **Estado da integração**: ready-for-merge
- **Tip congelado para integração**: ponta deste commit de estado, registrada no histórico após o commit
- **Arquivos dirty esperados**: nenhum
- **Operação Git pendente**: none
- **Push**: não solicitado
- **Motivo da parada**: bloco concluído e pronto para integração local
