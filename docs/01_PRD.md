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
