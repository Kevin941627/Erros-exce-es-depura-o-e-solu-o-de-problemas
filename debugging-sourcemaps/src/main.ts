import { runCalculation } from "./service";

// Tipagem mínima para process, evitando dependência de @types/node neste exemplo.
declare const process: { argv: string[]; exitCode?: number };

async function main(): Promise<void> {
    // "0" provoca a falha intencional dentro de compute().
    const input = process.argv[2] ?? "0";

    try {
        const result = await runCalculation(input);
        console.log("[main] Resultado:", result);
    } catch (error) {
        if (error instanceof Error) {
            console.error("[main] Erro capturado:", error.name, error.message);
            console.error(error.stack);
        } else {
            console.error("[main] Erro desconhecido:", error);
        }

        process.exitCode = 1;
    }
}

void main();
