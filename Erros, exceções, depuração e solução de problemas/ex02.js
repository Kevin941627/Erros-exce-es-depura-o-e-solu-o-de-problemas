// 1. Busca o produto
function buscarProduto() {
    return Promise.resolve({ nome: "Notebook", preco: 2000 });
}

// 2. Calcula o valor
function calcularPreco(produto) {
    return Promise.resolve({
        nome: produto.nome,
        total: produto.preco * 2
    });
}

// 3. Finaliza o pedido
function finalizarPedido() {
    buscarProduto()
        .then(produto => {
            calcularPreco(produto); // Erro: faltou return
        })
        .then(resultado => {
            console.log("Pedido:", resultado);
            return resultado;
        })
        .catch(erro => {
            console.log("Erro ignorado:", erro);
        });
}

// 4. Executa sem await
async function executar() {
    finalizarPedido(); // Não aguarda o resultado
}

executar();