# 15 - Demo do MVP

Data: 2026-06-04

Task: TASK-061 - Preparar demo.

## Objetivo da demo

Mostrar que o G.A Essencia substitui a planilha manual para registrar
atendimentos, calcular automaticamente a parte da clinica e o ganho do
profissional, e gerar fechamento mensal com exportacao CSV.

Mensagem central:

```txt
Agenda, cuidado e equilibrio financeiro para seus atendimentos.
```

## Duracao sugerida

10 a 15 minutos.

## Checklist antes de apresentar

1. Rodar validacoes tecnicas:

```bash
npm run test
npm run lint
npm run build
```

2. Iniciar o app:

```bash
npm run dev
```

3. Abrir a URL local do Vite.

4. Confirmar que o `.env` esta configurado:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

5. Confirmar que existe um usuario no Supabase Auth.

6. Conferir se ha pelo menos:

- 1 paciente ativo;
- 1 profissional ativo;
- 3 servicos ativos;
- 1 brinde com valor `0`.

## Dados sugeridos para a demo

### Paciente

| Campo | Valor |
| --- | --- |
| Nome | Beatriz Cedraz |
| Telefone | 11999990000 |
| Observacoes | Cliente usada para demonstracao do MVP |

### Profissional

| Campo | Valor |
| --- | --- |
| Nome | Geane Araujo |
| Especialidade | Massoterapia |
| Percentual padrao | 30 |
| PIX | demo@gaessencia.com |

### Servicos

| Nome | Valor | Duracao | Percentual |
| --- | ---: | ---: | ---: |
| Massagem Terapeutica | 110 | 60 | 30 |
| Drenagem Linfatica | 160 | 60 | 30 |
| Brinde massagem facial | 0 | 30 | 0 |

## Roteiro de apresentacao

### 1. Login e proposta

Abrir a tela de login e entrar com um usuario valido.

Ponto de fala:

```txt
Hoje o controle que antes ficava em planilha passa para um sistema com agenda,
cadastros, calculo automatico e fechamento mensal.
```

### 2. Dashboard

Abrir `Dashboard`.

Mostrar:

- faturamento do mes;
- receita da clinica;
- ganho profissional;
- atendimentos realizados;
- atendimentos de hoje;
- proximos atendimentos.

Ponto de fala:

```txt
A primeira tela ja responde o que normalmente exigia abrir a planilha e somar
linhas manualmente.
```

### 3. Pacientes

Abrir `Pacientes`.

Demonstrar:

- criar paciente;
- buscar por nome;
- editar paciente;
- inativar paciente.

Sugestao:

Criar ou localizar `Beatriz Cedraz`.

### 4. Profissionais

Abrir `Profissionais`.

Demonstrar:

- criar profissional;
- preencher especialidade, telefone, PIX e percentual padrao;
- editar;
- inativar.

Sugestao:

Usar `Geane Araujo` com percentual padrao de `30%`.

### 5. Servicos

Abrir `Servicos`.

Demonstrar:

- criar servico de `R$ 110,00` com `30%`;
- criar servico de `R$ 160,00` com `30%`;
- criar brinde com valor `0` e percentual `0`;
- editar um servico;
- inativar um servico se necessario.

Ponto de fala:

```txt
O percentual fica no servico, mas o atendimento salva o percentual usado no
momento. Assim o historico financeiro nao muda se o preco mudar depois.
```

### 6. Atendimento com calculo automatico

Abrir `Atendimentos` e clicar em `Novo atendimento`.

Criar um atendimento:

| Campo | Valor |
| --- | --- |
| Paciente | Beatriz Cedraz |
| Profissional | Geane Araujo |
| Servico | Massagem Terapeutica |
| Data | data atual |
| Hora | 10:00 |
| Status | Realizado |
| Valor | 110 |
| Percentual | 30 |

Conferir o bloco `Calculo`:

| Campo | Valor esperado |
| --- | ---: |
| Valor total | R$ 110,00 |
| Clinica | R$ 33,00 |
| Profissional | R$ 77,00 |

Criar outro atendimento, se houver tempo:

| Servico | Valor | Percentual | Clinica | Profissional |
| --- | ---: | ---: | ---: | ---: |
| Drenagem Linfatica | 160 | 30 | 48 | 112 |
| Brinde massagem facial | 0 | 0 | 0 | 0 |

### 7. Filtros de atendimentos

Na listagem de atendimentos, demonstrar:

- filtro por paciente;
- filtro por profissional;
- filtro por servico;
- filtro por status;
- botao `Limpar`.

### 8. Relatorios

Abrir `Relatorios`.

Demonstrar:

- filtro por mes;
- filtro por ano;
- filtro por profissional;
- filtro por servico;
- totais do periodo;
- breakdown por servico;
- breakdown por profissional;
- estado vazio quando nao ha atendimentos.

Ponto de fala:

```txt
O fechamento mensal fica pronto sem recalcular a planilha. Os status Realizado e
Pago entram no financeiro; Agendado, Cancelado e Faltou ficam fora.
```

### 9. Exportacao CSV

Clicar em `Exportar CSV`.

Conferir:

- arquivo gerado;
- separador `;`;
- colunas do relatorio;
- valores de clinica e profissional.

## Evidencias de calculo

A planilha real foi conferida na `TASK-060`:

| Campo | Valor |
| --- | ---: |
| Linhas conferidas | 41 |
| Brindes | 18 |
| Total valor | 3.214,00 |
| Total clinica | 964,20 |
| Total ganho profissional | 2.249,80 |
| Divergencias encontradas | 0 |

Use este ponto na demo:

```txt
Os calculos foram comparados com a planilha real e nao houve divergencia.
```

## Perguntas esperadas

### O sistema substitui a planilha?

Sim para o escopo do MVP: agenda, cadastros, calculo, dashboard, relatorio e CSV.

### O que entra no financeiro?

Entram:

- Realizado;
- Pago.

Nao entram:

- Agendado;
- Cancelado;
- Faltou.

### E se o valor do servico mudar depois?

O atendimento salva o valor e o percentual usados no momento. O historico
financeiro fica preservado.

### Brinde aparece no relatorio?

Sim, como atendimento financeiro de valor zero quando estiver com status
`Realizado` ou `Pago`.

### O que ficou fora do MVP?

- pagamento online;
- PIX automatico;
- WhatsApp automatico;
- assinatura SaaS;
- multi-clinica avancado;
- app nativo;
- estoque;
- prontuario clinico.

## Plano B para demo ao vivo

Se a internet ou Supabase falhar:

1. Mostrar o README e os documentos de validacao.
2. Mostrar prints/evidencias em `.codex-temp`.
3. Mostrar os testes passando.
4. Explicar o fluxo com os dados sugeridos.

Se a base estiver vazia:

1. Criar profissional.
2. Criar paciente.
3. Criar os tres servicos sugeridos.
4. Criar atendimento `R$ 110,00` com `30%`.
5. Abrir relatorio do mes.

## Criterios de demo pronta

- Login funcionando.
- Dashboard acessivel.
- Pacientes, profissionais e servicos criaveis pela UI.
- Atendimento criado em menos de 30 segundos.
- Calculo `110 / 30% = 33 / 77` visivel.
- Relatorio do mes carregando.
- CSV exportavel.
- Validacoes tecnicas passando.
