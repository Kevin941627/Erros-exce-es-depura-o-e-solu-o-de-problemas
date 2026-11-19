"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("./service");
async function main() {
    // "0" provoca a falha intencional dentro de compute().
    const input = process.argv[2] ?? "0";
    try {
        const result = await (0, service_1.runCalculation)(input);
        console.log("[main] Resultado:", result);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("[main] Erro capturado:", error.name, error.message);
            console.error(error.stack);
        }
        else {
            console.error("[main] Erro desconhecido:", error);
        }
        process.exitCode = 1;
    }
}
void main();
//# sourceMappingURL=main.js.map