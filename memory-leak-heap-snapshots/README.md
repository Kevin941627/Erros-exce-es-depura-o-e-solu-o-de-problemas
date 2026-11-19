# Laboratório: encontrando e corrigindo memory leak com Chrome DevTools

## Arquivos
- `index.html`: interface do laboratório.
- `style.css`: aparência.
- `app.js`: cenário vulnerável e cenário corrigido.

## Como abrir
1. Extraia a pasta.
2. Abra `index.html` no Chrome (ou use a extensão Live Server do VS Code).
3. Pressione F12 para abrir o Chrome DevTools.
4. Selecione a aba **Memory**.
5. Em **Select profiling type**, escolha **Heap snapshot**.
6. Clique em **Take snapshot** para registrar o estado inicial.

## Quatro snapshots solicitados

Use nomes/etiquetas no seu relatório para não confundir os arquivos:

### Snapshot 1 — antes do cenário vulnerável
1. Recarregue a página.
2. Abra Memory → Heap snapshot.
3. Clique em **Take snapshot** antes de apertar qualquer botão.
4. Registre como `S1 - antes do leak`.

### Snapshot 2 — depois do cenário vulnerável
1. Clique em **Iniciar vazamento (10 ciclos)** uma vez.
2. Aguarde alguns segundos.
3. Volte ao Memory e clique em **Take snapshot**.
4. Registre como `S2 - depois do leak`.
5. Selecione S1 e S2 e use **Comparison** (ou o seletor de comparação).
6. Procure crescimento em `Array`, `String`, `Function`, `HTMLButtonElement` e closures/listeners. Em `Retainers`, siga a cadeia de referências até `leakedHandlers`, `leakedClosures` ou `leakedTimers` (variáveis globais).

### Snapshot 3 — antes do cenário corrigido
1. Recarregue a página para zerar o cenário vulnerável. Não use o botão vulnerável nesta rodada.
2. Abra Memory e tire um snapshot antes de executar o cenário corrigido.
3. Registre como `S3 - antes do corrigido`.

### Snapshot 4 — depois do cenário corrigido e cleanup
1. Clique em **Executar cenário corrigido (10 ciclos)**.
2. Clique em **Limpar cenário corrigido**.
3. Aguarde alguns segundos.
4. Opcional: clique no ícone **Collect garbage** (lixeira) no painel Memory, se disponível.
5. Tire o quarto snapshot e registre como `S4 - depois do cleanup`.
6. Compare S3 e S4. Após GC, os arrays/closures/elementos do cenário corrigido devem deixar de aparecer como retidos por `fixedResources`; o total de objetos retidos deve voltar próximo do nível inicial.

> Importante: heap snapshots variam entre versões do Chrome e incluem ruído do próprio navegador. O resultado confiável é a cadeia de retenção e a comparação dos objetos do aplicativo, não uma igualdade exata do tamanho total do heap.

## O que deve ser observado

### No cenário vulnerável
- `leakedHandlers` e `leakedClosures` são arrays globais que mantêm referências vivas.
- Cada handler fecha sobre `payload` e `node`, portanto o array grande e o elemento DOM continuam alcançáveis.
- `leakedTimers` guarda IDs de intervalos; os intervalos continuam executando e suas callbacks retêm `payload`/`node`.
- O crescimento esperado é de aproximadamente 500 mil entradas de payload por execução (10 arrays × 50.000 strings), além de nós, funções e timers.

### No cenário corrigido
- `clearInterval` cancela cada timer.
- `removeEventListener` remove os listeners.
- `remove()` destaca os nós da árvore DOM.
- `payload`, `handler` e `node` são anulados e `fixedResources` é esvaziado.
- Depois de GC, os objetos ficam elegíveis para coleta.

## Heurísticas (relatório de 50–100 palavras)

Compare o **retained size**, não apenas o shallow size: retained size estima a memória que seria liberada se aquele objeto deixasse de ser alcançável. Na aba **Retainers**, siga quem mantém arrays, closures e nós DOM vivos. Procure **Detached DOM trees** quando elementos removidos continuam referenciados. Inspecione listeners e timers persistentes, pois callbacks podem reter closures e grandes dados. Após corrigir, remova listeners, cancele timers e elimine referências; force GC e compare os snapshots novamente.

## Limitações e interpretação
- O projeto não gera arquivos `.heapsnapshot` automaticamente: eles devem ser capturados no Chrome DevTools, pois representam o heap real daquela sessão do navegador.
- Não registre arrays/objetos inteiros no Console durante a medição; o Console pode manter referências e alterar o resultado.
- O cenário vulnerável é intencional e deve ser executado apenas uma vez por recarga para manter a comparação simples.
