function executar() {
    try {
        throw new Error("Erro síncrono!");
    } catch (erro) {
        console.error("Erro capturado:", erro.stack);
        throw erro; // Mantém a propagação
    }
}

try {
    executar();
} catch (erro) {
    console.error("Erro tratado no nível superior:", erro.stack);
}