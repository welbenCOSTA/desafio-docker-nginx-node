# Nginx como Proxy Reverso com Node.js

Aplicação Node.js atrás do Nginx, com os nomes gravados no MySQL. Cada acesso em `http://localhost:8080` insere um nome na tabela `people` e devolve a lista em HTML.

## Como executar

Na raiz deste diretório, com Docker e Docker Compose instalados:

```bash
docker compose up
```

O build das imagens, o `npm install` e a criação da tabela acontecem dentro dos containers. Não é preciso rodar nenhum comando extra.

Abra http://localhost:8080. A resposta traz o título e os nomes já cadastrados:

```html
<h1>Full Cycle Rocks!</h1>
<ul>
  <li>Wescley</li>
  <li>Luiz</li>
</ul>
```

Atualizar a página inclui mais um nome.

## Fluxo

1. O navegador fala com o Nginx na porta 8080.
2. O Nginx encaminha a requisição para a aplicação Node.js.
3. O Node.js grava um nome na tabela `people` e lê a lista no MySQL.

O código em `node/` está montado no container, então alterações em `index.js` entram no ambiente de desenvolvimento. O diretório `node_modules` fica em um volume próprio, preservando as dependências instaladas na imagem.

## Parar

```bash
docker compose down
```
