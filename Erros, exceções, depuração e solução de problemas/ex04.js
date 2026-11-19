async function exemplo() {
    try {
        const dados = await safeFetchJson(
            "https://jsonplaceholder.typicode.com/users/1"
        );

        console.log("Dados recebidos:", dados);

    } catch (erro) {
        console.error(erro.name, erro.message);
    }
}

exemplo();