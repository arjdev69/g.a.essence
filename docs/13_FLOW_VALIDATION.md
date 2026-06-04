# 13 - Validacao de fluxo completo

Data: 2026-06-04

Task: TASK-059 - Testar fluxo completo.

## Status

Bloqueado.

O fluxo completo do MVP nao pode ser aprovado porque o cadastro de servicos nao
abre formulario a partir do botao `Novo servico`. Sem um servico ativo, o fluxo
de criacao de atendimento nao pode ser concluido pela interface quando a base
esta vazia.

## Ambiente validado

- URL local: `http://127.0.0.1:5174`
- Sessao autenticada: sim
- Rotas principais respondendo: sim
- Data de referencia do dashboard/relatorio: junho de 2026

## Checks automatizados

- `npm run test`: aprovado, 13 testes.
- `npm run lint`: aprovado.
- `npm run build`: executar novamente apos este relatorio.

## Fluxo testado

### Autenticacao e rotas

- `/` redirecionou para `/dashboard`.
- `/dashboard` abriu com sessao autenticada.
- Menu principal exibiu Dashboard, Atendimentos, Pacientes, Profissionais,
  Servicos e Relatorios.

Resultado: aprovado.

### Pacientes

- Criado paciente pela interface:
  `QA Codex Paciente 1780576091660`.
- Registro apareceu na listagem de pacientes ativos.

Resultado: aprovado.

### Profissionais

- Criado profissional pela interface:
  `QA Codex Profissional 1780576148685`.
- Registro apareceu na listagem de profissionais ativos com percentual `30%`.

Resultado: aprovado.

### Servicos

- A pagina `/services` abriu.
- O botao `Novo servico` foi exibido.
- Ao acionar o botao, nenhum modal/formulario foi aberto.
- A pagina `ServicesPage` lista servicos, mas nao conecta `ServiceForm` ao fluxo
  de criacao.

Resultado: reprovado.

Impacto:

- RF-009, cadastro de servicos, nao fica completo pela UI.
- FEATURE-004, criar/listar/editar/inativar servico, nao fica completo pela UI.
- FEATURE-005, criacao de atendimento, fica bloqueada quando nao existe servico
  ativo.

### Atendimentos

- A pagina `/appointments` abriu.
- O modal `Novo atendimento` abriu.
- O paciente e o profissional criados apareceram como opcoes.
- O select de servico apareceu apenas com `Selecione um servico`, sem opcoes
  ativas.
- O calculo inicial exibiu `R$ 0,00` para valor total, clinica e profissional.

Resultado: bloqueado por ausencia de servico ativo criado pela UI.

### Relatorios

- A pagina `/reports` abriu.
- Filtros de mes, ano, profissional e servico foram exibidos.
- O profissional criado apareceu no filtro.
- O estado vazio do relatorio foi exibido corretamente.
- O botao `Exportar CSV` foi exibido.

Resultado: aprovado para estado vazio; fluxo com atendimento financeiro nao foi
validado por causa do bloqueio em Servicos.

## Evidencias visuais

- `.codex-temp/task-059-services-blocker.png`
- `.codex-temp/task-059-appointment-modal.png`

## Conclusao

A TASK-059 foi executada como validacao, mas o fluxo completo nao passa.

O proximo passo recomendado antes da TASK-060 e corrigir o fluxo de Servicos:

- conectar o botao `Novo servico` ao `ServicesPage`;
- abrir `ServiceForm` em modal;
- salvar servico via `serviceRepository.create`;
- permitir editar e inativar servicos, conforme FEATURE-004.
