# G.A Essencia

Especificacao da imagem opcional do produto.

Produto: G.A Essencia
Objetivo: definir como a imagem do produto deve funcionar no modulo de Produtos.

# 23 - Product Image Spec

## 1. Escopo

A imagem do produto e um atributo opcional do cadastro.
Ela existe para facilitar reconhecimento visual em listas, cards e detalhes.

O sistema deve continuar funcionando normalmente sem imagem.

## 2. Objetivos

- facilitar identificacao rapida do produto;
- melhorar leitura visual em listas longas;
- manter o cadastro simples;
- nao bloquear o fluxo de estoque quando nao houver imagem.

## 3. Regras funcionais

### RF-201 Upload de imagem

Permitir enviar uma imagem para associar ao produto.

### RF-202 Preview da imagem

Exibir preview antes de salvar.

### RF-203 Remocao de imagem

Permitir remover a imagem durante edicao.

### RF-204 Fallback visual

Exibir placeholder quando o produto nao tiver imagem.

### RF-205 Exibicao em lista

Exibir thumbnail pequena na listagem de produtos quando houver imagem.

### RF-206 Exibicao em detalhe

Exibir preview maior no formulario ou detalhe do produto.

## 4. Regras de negocio

- a imagem e opcional;
- a ausencia de imagem nao impede cadastro nem edicao;
- a imagem nao altera saldo, status ou movimentacao;
- a imagem pertence a um unico produto;
- a imagem pode ser substituida por outra;
- a remocao da imagem nao apaga o produto;
- o sistema deve preservar o historico do produto mesmo sem imagem;
- a imagem nao deve ser obrigatoria em nenhuma validacao do MVP.

## 5. Formatos aceitos

Recomendado:

- `image/png`;
- `image/jpeg`;
- `image/webp`.

Nao recomendado no MVP:

- `image/svg+xml` para upload geral;
- gifs animados;
- arquivos de video.

## 6. Tamanho e limite

Recomendacao inicial:

- tamanho maximo: 5 MB;
- dimensao minima util: 256 x 256;
- dimensao sugerida para preview: 400 x 400;
- thumbnail sugerida: 48 x 48 ou 56 x 56.

## 7. Validacoes

- arquivo deve existir quando o usuario selecionar upload;
- formato deve estar entre os aceitos;
- tamanho nao pode exceder o limite definido;
- a imagem deve ser legivel em thumbnail;
- upload com falha deve mostrar mensagem objetiva;
- usuario deve poder salvar o produto mesmo sem imagem.

## 8. UX do upload

### Formulario de produto

Componentes:

- area de upload com texto de ajuda;
- preview da imagem selecionada;
- botao `Remover imagem`;
- texto de orientacao sobre formatos aceitos.

Comportamento:

- arrastar e soltar e opcional;
- clique para selecionar arquivo e suficiente para o MVP;
- mostrar preview imediatamente;
- manter fallback quando nao houver imagem;
- indicar erro em caso de formato ou tamanho invalido.

## 9. Exibicao na interface

### Lista

- mostrar thumbnail pequena ao lado do nome;
- usar placeholder quando nao existir imagem;
- manter alinhamento consistente em linhas e cards.

### Formulario

- mostrar preview maior no topo da area de imagem;
- manter o campo de imagem separado dos campos obrigatorios;
- nao empurrar o restante do formulario para baixo de forma exagerada.

### Detalhe

- exibir imagem maior do que a thumbnail;
- manter proporcao quadrada ou levemente retangular;
- usar borda sutil e fundo neutro.

## 10. Fallback visual

Quando nao houver imagem:

- mostrar um bloco neutro com icone de produto;
- usar texto curto como `Sem imagem`;
- manter o mesmo espaco visual para nao quebrar a linha.

## 11. Persistencia sugerida

Recomendacao de modelagem:

- salvar URL da imagem em `products.image_url`;
- armazenar arquivo em bucket do Supabase ou storage equivalente;
- manter apenas a referencia no registro do produto;
- nao salvar o binario diretamente no banco relacional.

## 12. Estados

### Upload em andamento

- mostrar progresso ou loading discreto;
- desabilitar salvamento enquanto houver envio ativo, se necessario.

### Erro de upload

- exibir mensagem curta;
- permitir nova tentativa;
- nao perder os dados ja preenchidos do formulario.

### Sucesso

- mostrar preview da imagem salva;
- manter consistencia entre preview local e URL persistida.

## 13. Critérios de aceite

- cadastrar produto com imagem;
- editar produto e trocar imagem;
- remover imagem sem apagar o produto;
- listar produtos com thumbnail quando houver imagem;
- salvar produto sem imagem;
- exibir placeholder quando nao houver arquivo.
