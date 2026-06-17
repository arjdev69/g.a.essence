# G.A Essencia

Documentacao para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essencia
Objetivo: sistema de agendamento com calculo automatico da taxa da clinica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 07 - UX Spec

## 1. Principio

O sistema deve ser mais simples que uma planilha.

## 2. Rotas

- `/login`
- `/dashboard`
- `/appointments`
- `/patients`
- `/professionals`
- `/services`
- `/reports`

## 3. Layout

Desktop:
- sidebar;
- header;
- conteudo em cards e tabelas.

Mobile:
- header;
- cards;
- botao de acao principal;
- evitar tabela horizontal.

## 4. Dashboard

Cards:
- faturamento do mes;
- receita da clinica;
- ganho profissional;
- atendimentos realizados.

Secoes:
- atendimentos de hoje;
- proximos atendimentos.

## 5. Agenda

Desktop:
Data | Hora | Paciente | Servico | Profissional | Valor | Clinica | Profissional | Status | Acoes

Mobile:
Card com paciente, servico, data/hora, valor e status.

Acoes secundarias por atendimento:
- editar;
- adicionar ao calendario;
- remover, quando aplicavel.

## 6. Formulario de atendimento

Ordem:
1. paciente;
2. profissional;
3. servico;
4. data;
5. hora;
6. status;
7. valor;
8. percentual;
9. observacao.

Area de calculo sempre visivel:
- valor total;
- clinica;
- profissional.

## 7. Pacientes

Lista com nome, telefone e acoes.
Detalhe com historico.

## 8. Servicos

Mostrar badge `Brinde` quando valor for 0.

## 9. Relatorios

Filtros:
- mes;
- ano;
- profissional;
- servico.

Botoes:
- exportar CSV;
- limpar filtros.

## 10. Feedback

Sucesso:
`Atendimento criado com sucesso.`

Erro:
`Nao foi possivel salvar. Tente novamente.`

Empty:
`Nenhum atendimento encontrado.`

## 11. Acessibilidade

- inputs com label;
- botoes com texto;
- foco visivel;
- contraste adequado.

## 12. Acao de Calendario

Objetivo:
- permitir que o usuario exporte o atendimento para o calendario sem sair da tela.

Desktop:
- botao secundario na coluna de acoes da tabela;
- label visivel `Adicionar ao calendario`;
- icone de calendario antes do texto;
- ordem das acoes: editar, adicionar ao calendario, remover.

Mobile:
- botao no rodape do card do atendimento;
- label visivel, nao apenas icone;
- area de toque generosa;
- se houver muitas acoes, mover para menu secundario.

Estados:
- normal;
- hover;
- foco;
- desabilitado;
- sucesso;
- erro.
