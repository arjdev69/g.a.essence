# G.A Essência

Documentação para desenvolvimento do MVP usando Spec Driven Development com apoio do Codex.

Produto: G.A Essência
Objetivo: sistema de agendamento com cálculo automático da taxa da clínica e ganho do profissional.
Stack alvo: React + TypeScript + Vite + Tailwind + Supabase.

# 02 — Requirements

## 1. Glossário

- Atendimento: serviço prestado a um paciente.
- Clínica: parte que recebe comissão.
- Profissional: pessoa que realiza atendimento.
- Serviço: tipo de atendimento.
- Comissão: percentual da clínica.
- Brinde: serviço de valor zero.
- Status financeiro: status que entra no relatório.

## 2. Perfis

No MVP existe um usuário autenticado administrador. Profissionais são entidades cadastradas, não usuários com login.

## 3. Requisitos funcionais

### RF-001 Login
Permitir login com e-mail e senha.

### RF-002 Logout
Permitir encerrar sessão.

### RF-003 Rotas protegidas
Usuário sem sessão não acessa rotas internas.

### RF-004 Cadastro de pacientes
Campos: nome, telefone, data de nascimento e observações.

### RF-005 Listagem de pacientes
Listar e buscar pacientes por nome.

### RF-006 Edição de pacientes
Permitir editar dados.

### RF-007 Inativação de pacientes
Paciente com histórico não deve ser apagado fisicamente.

### RF-008 Cadastro de profissionais
Campos: nome, telefone, especialidade, chave PIX, percentual padrão e ativo.

### RF-009 Cadastro de serviços
Campos: nome, valor padrão, duração, percentual da clínica e ativo.

### RF-010 Criar atendimento
Campos: paciente, profissional, serviço, data, hora, descrição, observação, valor, percentual e status.

### RF-011 Cálculo automático
Ao selecionar serviço, preencher valor e percentual e calcular clínica/profissional.

### RF-012 Edição de atendimento
Permitir alterar dados, status, valor e percentual.

### RF-013 Status
Status permitidos: scheduled, completed, cancelled, no_show, paid.

### RF-014 Filtros
Filtrar atendimentos por data, paciente, profissional, serviço e status.

### RF-015 Dashboard
Exibir totais mensais e próximos atendimentos.

### RF-016 Relatório mensal
Exibir total faturado, clínica, profissional, quantidade, por serviço e por profissional.

### RF-017 Exportação CSV
Exportar relatório em CSV com separador `;`.

### RF-018 Histórico do paciente
Exibir atendimentos anteriores do paciente.

### RF-019 Brindes
Permitir serviço com valor zero.

## 4. Requisitos não funcionais

- RNF-001: layout responsivo.
- RNF-002: telas carregam em até 2 segundos para uso comum.
- RNF-003: dados isolados por usuário.
- RNF-004: criação de atendimento simples e rápida.
- RNF-005: código modular e tipado.
- RNF-006: funções de cálculo com testes unitários.
- RNF-007: arquitetura preparada para multi-clínica futura.

## 5. Regras de negócio

- RN-001: percentual padrão é 30%.
- RN-002: cada serviço pode ter percentual próprio.
- RN-003: atendimento salva percentual usado no momento.
- RN-004: atendimento salva valores calculados.
- RN-005: brinde gera clínica 0 e profissional 0.
- RN-006: cancelled não entra no financeiro.
- RN-007: no_show não entra no financeiro.
- RN-008: completed e paid entram no financeiro.
- RN-009: histórico deve ser preservado.

## 6. Critérios de aceite

- R$ 110 com 30% = clínica R$ 33 e profissional R$ 77.
- R$ 160 com 30% = clínica R$ 48 e profissional R$ 112.
- R$ 0 = clínica R$ 0 e profissional R$ 0.
- Cancelado não entra no relatório.
- Realizado entra no relatório.
- Pago entra no relatório.
