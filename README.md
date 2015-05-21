# Front End Starter Kit

Framework front-end com workflow simplificado.

**IE9+ ready.**

## Instalação

Você precisa ter instalado o *Node.js*. Caso não tenha, baixe [aqui](http://nodejs.org/).

Se você já tiver o *Node.js* instalado, precisa instalar também o [Gulp](http://gulpjs.com/) e o [Bower](http://bower.io/). Ambos podem ser instalados utilizando o comando:

```
npm install -g bower gulp
```

(É necessário já ter o *Node.js* instalado).

## Como utilizar

1 - Clone o repositório ou baixe o zip (botão do lado direito);

2 - Acesse a pasta do projeto via terminal/cmd;

3 - Instale as dependências do projeto utilizando `npm install` e depois `bower install`;

(Caso qualquer um desses comandos não estiverem disponíveis no terminal/cmd, vide [Instalação](#instalacao))

4 - utilize o comando `gulp serve` para iniciar o servidor;


## TODO
- [x] Corrigir bug onde o arquivo pai de Sass nao recompila quando o filho é alterado (bug do Jerry);
- [ ] Adicionar load de css em arquivo Sass;
- [ ] Suporte a sprites SVG;
- [ ] Otimização de SVG;
- [ ] Suporte a HTML partials;
