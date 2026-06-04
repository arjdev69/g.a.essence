# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 07 — UX Spec

## 1. Princípio

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
- conteúdo em cards e tabelas.

Mobile:
- header;
- cards;
- botão de ação principal;
- evitar tabela horizontal.

## 4. Dashboard

Cards:
- faturamento do mês;
- receita da clínica;
- ganho profissional;
- atendimentos realizados.

Seções:
- atendimentos de hoje;
- próximos atendimentos.

## 5. Agenda

Desktop:
Data | Hora | Paciente | Serviço | Profissional | Valor | Clínica | Profissional | Status | Ações

Mobile:
Card com paciente, serviço, data/hora, valor e status.

## 6. Formulário de atendimento

Ordem:
1. paciente;
2. profissional;
3. serviço;
4. data;
5. hora;
6. status;
7. valor;
8. percentual;
9. observação.

Área de cálculo sempre visível:
- valor total;
- clínica;
- profissional.

## 7. Pacientes

Lista com nome, telefone e ações.
Detalhe com histórico.

## 8. Serviços

Mostrar badge `Brinde` quando valor for 0.

## 9. Relatórios

Filtros:
- mês;
- ano;
- profissional;
- serviço.

Botões:
- exportar CSV;
- limpar filtros.

## 10. Feedback

Sucesso:
`Atendimento criado com sucesso.`

Erro:
`Não foi possível salvar. Tente novamente.`

Empty:
`Nenhum atendimento encontrado.`

## 11. Acessibilidade

- inputs com label;
- botões com texto;
- foco visível;
- contraste adequado.
