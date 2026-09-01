# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 01 — PRD: Product Requirements Document

## 1. Visão do Produto

G.A Essência é uma aplicação web responsiva para profissionais de bem-estar e pequenas clínicas controlarem agenda, pacientes, serviços, profissionais e divisão financeira de atendimentos.

A aplicação substitui a planilha manual usada para registrar paciente, data, serviço, observação, valor, ganho profissional e comissão da clínica.

## 2. Problema

Profissionais usam Excel, Google Sheets, caderno e WhatsApp. Isso gera:

- cálculo manual da comissão;
- risco de erro financeiro;
- dificuldade para fechar o mês;
- falta de histórico do paciente;
- falta de dashboard;
- dificuldade para escalar com mais profissionais.

## 3. Público-alvo

Primário:
- massoterapeutas;
- terapeutas integrativos;
- esteticistas;
- profissionais de drenagem linfática;
- profissionais de spa dos pés.

Secundário:
- clínicas de estética;
- espaços terapêuticos;
- clínicas de bem-estar;
- salões e studios com profissionais parceiros.

Futuro:
- fisioterapeutas;
- psicólogos que dividem sala;
- nutricionistas;
- quiropraxistas.

## 4. Personas

### Persona 1 — Ana, massoterapeuta
Usa planilha, atende em clínica parceira e precisa dividir 30% para a clínica. Quer criar atendimento rápido e fechar o mês sem erro.

### Persona 2 — Juliana, dona de clínica
Tem profissionais parceiros e precisa saber quanto cada pessoa gerou e quanto a clínica deve receber.

### Persona 3 — Camila, esteticista iniciante
Usa WhatsApp e caderno. Quer se organizar sem contratar sistema caro.

## 5. Proposta de Valor

Cadastrar atendimento em menos de 30 segundos e calcular automaticamente:

- valor total;
- taxa da clínica;
- ganho do profissional;
- totais do mês.

Frase: **Agenda, cuidado e equilíbrio financeiro para seus atendimentos.**

## 6. Escopo do MVP

Incluído:
- login;
- dashboard;
- cadastro de pacientes;
- cadastro de profissionais;
- cadastro de serviços;
- cadastro de atendimentos;
- cálculo automático;
- status de atendimento;
- relatório mensal;
- exportação CSV;
- layout mobile first.

Fora do MVP:
- pagamento online;
- PIX automático;
- WhatsApp automático;
- assinatura SaaS;
- multi-clínica avançado;
- app nativo;
- estoque;
- prontuário clínico.

## 7. Funcionalidades

### Dashboard
Mostra faturamento do mês, receita da clínica, ganho profissional, quantidade de atendimentos, atendimentos de hoje e próximos atendimentos.

### Pacientes
CRUD com nome, telefone, data de nascimento e observações.

### Profissionais
CRUD com nome, telefone, especialidade, chave PIX, percentual padrão e status.

### Serviços
CRUD com nome, valor, duração, percentual da clínica e status.

### Atendimentos
Criação, edição, status, filtros e cálculo automático.

### Relatórios
Resumo mensal por período, profissional e serviço.

### Exportação CSV
Exporta relatório mensal com separador `;`.

## 8. Métricas de sucesso

- atendimento criado em menos de 30 segundos;
- erro de cálculo igual a zero;
- relatório mensal gerado em menos de 10 segundos;
- uso confortável no celular;
- validação com 3 a 5 profissionais reais.

## 9. Modelo de receita futuro

- Starter: R$ 19,90/mês, 1 profissional.
- Pro: R$ 49,90/mês, até 5 profissionais.
- Clínica: R$ 99,90/mês, profissionais ilimitados.

## 10. Roadmap

V1: agenda, comissão e relatório.
V2: WhatsApp manual e mensagens prontas.
V3: PIX e financeiro avançado.
V4: multi-clínica e assinatura.
V5: app Flutter.

## 11. Riscos

- resistência à troca da planilha;
- excesso de funcionalidades;
- erro financeiro;
- baixa adoção inicial.

Mitigação: MVP simples, testes de cálculo e validação com usuários reais.

## 12. Evolução UX Mobile-first V2

### 12.1 Contexto

A usuária principal opera o sistema predominantemente pelo iPhone e relatou dificuldade para navegar, rolar páginas e combinar filtros. O menu fixo inferior ocupa a área de gesto do aparelho, a agenda permite apenas uma data exata e o relatório não permite filtrar por status.

### 12.2 Objetivo

Tornar o uso diário simples em telas de `320px` a `430px`, preservando a experiência desktop e permitindo que a usuária:

- navegue sem elementos cobrindo o conteúdo;
- consulte atendimentos de qualquer mês ou período personalizado;
- reconheça e remova filtros ativos;
- confira totais financeiros coerentes com o status selecionado;
- crie ou edite um atendimento sem perder de vista o repasse;
- conclua as tarefas principais com alvos de toque adequados e mensagens claras.

### 12.3 Funcionalidades da evolução

- **RF-020 — Navegação mobile por menu lateral**: substituir a navegação inferior fixa por drawer acionado pelo cabeçalho.
- **RF-021 — Período da agenda**: consultar mês atual, meses anteriores ou posteriores e intervalo personalizado.
- **RF-022 — Filtros combinados da agenda**: combinar busca, período, status, paciente, profissional e serviço, exibindo os filtros ativos.
- **RF-023 — Cards e ações de atendimento no celular**: apresentar dados essenciais e hierarquizar editar, calendário e remoção.
- **RF-024 — Relatório por status**: aplicar o status aos detalhes, indicadores e CSV, distinguindo volume total de volume financeiro.
- **RF-025 — Formulário mobile de atendimento**: reduzir esforço, preservar cálculo ao vivo e impedir submissão duplicada.
- **RF-026 — Consistência das telas mobile**: aplicar o mesmo sistema visual a login, dashboard, pacientes, profissionais e serviços.
- **RF-027 — Estados e feedback acessíveis**: padronizar carregamento, vazio, filtro sem resultado, erro e sucesso.

### 12.4 Métricas de sucesso da evolução

- a usuária encontra atendimentos de outro mês em até três interações após abrir a agenda;
- nenhum controle fixo cobre conteúdo ou a área de gesto do iPhone;
- o conjunto de filtros visível na tela é idêntico ao usado na exportação;
- criar um atendimento continua possível em até 30 segundos com dados previamente cadastrados;
- todas as telas funcionam sem rolagem horizontal a partir de `320px`;
- alvos de toque essenciais medem ao menos `44 × 44px`.

### 12.5 Premissas

| Premissa | Default assumido | Racional | Origem |
|---|---|---|---|
| Plataforma prioritária | Web responsiva instalada ou aberta no iPhone | É o dispositivo predominante da usuária principal | Relato do usuário |
| Navegação mobile | Drawer pelo cabeçalho; sem menu fixo inferior | Libera a rolagem e evita conflito com a barra de gesto | Protótipo aprovado |
| Período inicial da agenda | Mês corrente | Favorece operação e conferência mensal | Revisão UX aprovada |
| Aplicação de filtros | Atualização imediata, sem botão Aplicar | Reduz etapas em uma rotina frequente | Protótipo aprovado |
| Regras financeiras | Apenas `completed` e `paid` compõem faturamento | Preserva as regras RN-006 a RN-008 | Documentação existente |
| Desktop | Sidebar e tabelas continuam disponíveis | A evolução é mobile-first, não mobile-only | Escopo existente |

### 12.6 Questões em aberto

N/A — as decisões necessárias para a primeira implementação foram resolvidas no protótipo aprovado.
