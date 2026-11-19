# Debugging de código transpilado (TypeScript → JavaScript + source maps)

## Estrutura

- `src/main.ts`: ponto de entrada e tratamento do erro.
- `src/service.ts`: encadeia a chamada assíncrona.
- `src/compute.ts`: contém a falha intencional na linha marcada.
- `dist/*.js`: JavaScript gerado pelo compilador.
- `dist/*.js.map`: mapas externos que relacionam JavaScript e TypeScript.

## Requisitos

- Node.js 18 ou superior.
- npm.
- TypeScript 5.8 ou superior (instalado pelas dependências do projeto).

## Gerar JavaScript e source maps

Na pasta do projeto:

```bash
npm install
npm run build
```

O compilador gera os arquivos `.js` e `.js.map` dentro de `dist/`. A opção `sourceMap: true` cria mapas externos; `inlineSources: true` inclui o conteúdo TypeScript no mapa para facilitar a localização do fonte original.

## Depurar no Chrome DevTools (Node Inspector)

1. Abra um terminal na raiz do projeto.
2. Execute `npm run debug`. O Node inicia com `--inspect-brk` e pausa antes de executar o ponto de entrada.
3. Abra o Chrome e acesse `chrome://inspect`.
4. Em **Remote Target**, localize o processo Node e clique em **inspect**.
5. O Chrome DevTools abrirá. Na aba **Sources**, procure a árvore **Filesystem** ou **Page** e localize os arquivos TypeScript mapeados. Dependendo da versão do DevTools, eles podem aparecer sob `file://` ou em uma seção de fontes originais.
6. Abra `src/compute.ts` (ou a fonte original `compute.ts` exibida pelo mapa).
7. Clique na margem à esquerda da linha `throw new RangeError(...)`, marcada como **FALHA INTENCIONAL**.
8. Retorne ao terminal e pressione Enter se o processo estiver aguardando; a execução continua.
9. O debugger deve pausar no breakpoint de `compute.ts`. Na área **Call Stack**, confira `compute` → `runCalculation` → `main`. Em **Scope**, inspecione `input` e `parsed`.
10. Pressione **F8** para continuar. O erro será capturado em `main.ts` e o stack trace será impresso no terminal.

Se o DevTools abrir antes da execução, use o botão **Resume script execution** (▶) para sair da pausa inicial. O argumento padrão é `0`, que ativa a falha. Para testar sucesso, encerre a sessão e execute `node --inspect dist/main.js 4`.

### Alternativa: VS Code

1. Abra a pasta do projeto no VS Code.
2. Compile com `npm run build`.
3. Abra `src/compute.ts` e coloque o breakpoint na linha do `throw new RangeError(...)`.
4. Selecione **Run and Debug** → **create a launch.json file** → **Node.js**, ou crie `.vscode/launch.json` com:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug TypeScript via source maps",
      "program": "${workspaceFolder}/dist/main.js",
      "args": ["0"],
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

5. Inicie **Debug TypeScript via source maps**. O VS Code deve parar diretamente na linha TypeScript, não na linha equivalente do JavaScript gerado.

## O que deve aparecer no DevTools

- O arquivo `compute.ts` aberto com o breakpoint vermelho na linha do `throw`.
- Execução pausada nessa linha.
- `parsed` com valor `0` e `input` com valor `"0"`.
- Call Stack mostrando `compute`, `runCalculation` e `main`.
- Após continuar, o terminal mostra `RangeError: Não é possível calcular com divisor igual a zero.`

## Diagnóstico de falhas comuns

### 1. Source map inválido ou ausente
- Confirme que `sourceMap` está como `true`.
- Confirme que cada arquivo `.js` termina com um comentário semelhante a `//# sourceMappingURL=compute.js.map`.
- Recompile com `npm run build` após alterar o TypeScript.
- Verifique se o `.map` é JSON válido e contém `sources` e `mappings`.

### 2. Caminhos relativos errados
- Os mapas gerados ficam em `dist/` e apontam para `../src/*.ts`.
- Não mova os `.js` sem mover os `.map` junto.
- Se alterar `outDir`, `rootDir` ou `sourceRoot`, gere novamente os mapas e confira se os caminhos resolvem para `src/`.

### 3. Sourcemap inline vs. external
- Este projeto usa mapas externos: `compute.js.map` é um arquivo separado referenciado pelo comentário `sourceMappingURL`.
- Um mapa inline seria embutido no final do `.js` como um Data URL `data:application/json;base64,...`.
- Não misture configurações sem necessidade; para este exercício, mantenha `sourceMap: true` e não habilite `inlineSourceMap`.
- `inlineSources: true` não significa mapa inline: apenas incorpora o texto-fonte dentro do mapa externo.

### 4. Minificação
- Minificadores podem renomear variáveis e alterar posições de código.
- Em builds minificados, gere um novo source map depois da minificação e publique/forneça o `.map` correspondente.
- Para depuração didática, mantenha o JavaScript sem minificação.

### 5. Breakpoint não vincula ao TypeScript
- Verifique se o DevTools/VS Code está usando o `dist/*.js` e seu `.map` correspondente.
- Apague `dist/` e compile novamente se houver artefatos antigos.
- Confira se a URL/caminho do TypeScript exibido no mapa corresponde à pasta `src/`.
- No Node Inspector, use `--enable-source-maps` para que stack traces também apontem para os arquivos TypeScript.

## Comandos úteis

```bash
npm install
npm run build
npm run debug
# execução sem debugger, para observar o stack trace:
npm start
# caminho de sucesso:
node --enable-source-maps dist/main.js 4
```
