# G.A Essencia

Documento de requisitos para a nova secao de Produtos.

Produto: G.A Essencia
Objetivo: controlar cadastro, saldo e movimentacoes de produtos.

# 19 - Requirements

## 1. Glossario

- Produto: item cadastrado para controle de estoque.
- Movimento de estoque: registro de entrada, saida ou ajuste.
- Saldo atual: quantidade disponivel no momento.
- Estoque minimo: limite usado para alerta visual.
- Inativacao: produto fica indisponivel para novas operacoes, mas historico permanece.

## 2. Perfis

No MVP continua existindo um unico usuario autenticado administrador.
Esse usuario e responsavel por criar, ajustar e consultar o estoque.

## 3. Requisitos funcionais

### RF-101 Cadastro de produto

Permitir cadastrar produto com campos essenciais.
Opcionalmente, permitir imagem do produto para identificacao visual.

### RF-102 Listagem de produtos

Exibir produtos ativos e inativos com busca e filtros.

### RF-103 Edicao de produto

Permitir alterar dados cadastrais do produto.

### RF-104 Inativacao de produto

Permitir inativar produto sem remover historico.

### RF-105 Saldo atual

Exibir quantidade atual disponivel por produto.

### RF-106 Movimentacao de entrada

Permitir registrar aumento de estoque.

### RF-107 Movimentacao de saida

Permitir registrar reducao de estoque.

### RF-108 Movimentacao de ajuste

Permitir corrigir saldo por inventario, perda ou conferencia.

### RF-109 Historico de movimentacoes

Exibir movimentos por produto em ordem decrescente.

### RF-110 Alerta de estoque baixo

Sinalizar quando saldo estiver igual ou abaixo do estoque minimo.

### RF-111 Filtros

Permitir filtrar por nome, categoria, status e alerta de estoque baixo.

### RF-112 Navegacao de modulo

Disponibilizar a secao de Produtos no menu principal.

## 4. Requisitos nao funcionais

- RNF-101: layout responsivo.
- RNF-102: listagem enxuta no celular.
- RNF-103: cadastro com poucos cliques.
- RNF-104: dados isolados por usuario.
- RNF-105: historico persistente.
- RNF-106: codigo tipado e modular.
- RNF-107: testes para regras de saldo e alerta.

## 5. Regras de negocio

- RN-101: produto pertence a um unico usuario.
- RN-102: produto inativado nao pode receber novos movimentos.
- RN-103: saldo atual nao pode ficar negativo sem confirmacao explicita de ajuste.
- RN-104: entrada aumenta saldo.
- RN-105: saida reduz saldo.
- RN-106: ajuste pode ser positivo ou negativo para corrigir conferencia fisica.
- RN-107: estoque minimo aciona destaque visual.
- RN-108: historico de movimentos nao deve ser apagado.
- RN-109: cadastro inicial deve permitir unidade de medida simples.

## 6. Campos base sugeridos

### Produto

- nome;
- imagem opcional;
- codigo interno opcional;
- categoria opcional;
- unidade de medida;
- saldo atual;
- estoque minimo;
- custo medio opcional;
- observacao opcional;
- ativo.

### Movimento

- produto;
- tipo;
- quantidade;
- data e hora;
- observacao opcional;
- usuario responsavel.

## 7. Critérios de aceite

- cadastrar e listar produtos;
- registrar entrada e saida;
- visualizar saldo atualizado apos movimento;
- exibir alerta visual quando saldo estiver baixo;
- manter historico de movimentos por produto;
- inativar produto sem perder informacoes.
