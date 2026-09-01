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
- **Bloco atual**: 18 — Formulário, telas complementares e validação integrada (concluído; ready-for-merge)
- **Tasks concluídas neste bloco**: T-074, T-075, T-076
- **Em andamento (arquivo:linha)**: nenhum
- **Próximo passo**: congelar a ponta e integrar o Bloco 18 em `develop` com merge local `--no-ff`
- **Validação**: POST-005 aprovado — `npm test` (14 arquivos, 75 testes), `npm run build` e `npm run lint` passaram; axe não apontou violações critical/serious no escopo integrado; matriz cobre loading, vazio, erro recuperável e sucesso; build mantém apenas o aviso conhecido de bundle acima de 500 kB e os testes axe no jsdom registram o aviso de canvas não implementado; inspeção visual local permanece limitada a `/login` sem credenciais
- **Tentativas de baseline pré-task**: PRE-005 → 53f71a0db683463d350c09123cc74d766d070030 → `npm test`; `npm run build`; `npm run lint` → aprovado: 11 arquivos/63 testes, build e lint sem erros
- **Baseline inicial do bloco**: PRE-005 aprovado
- **Rebaselines de comando**: nenhum
- **Bloqueios**: nenhum
- **Modo Gitflow**: feature
- **Branch de produção**: main
- **Branch de integração**: develop
- **Branch de trabalho**: feature/bloco-18-formulario-telas
- **Base da branch (SHA)**: 53f71a0db683463d350c09123cc74d766d070030
- **Último commit de task validado**: 0b1fcce
- **Estado da integração**: ready-for-merge
- **Tip congelado para integração**: ponta deste commit de estado, registrada no histórico após o commit
- **Arquivos dirty esperados**: nenhum
- **Operação Git pendente**: none
- **Push**: não solicitado
- **Motivo da parada**: bloco concluído e pronto para integração local
