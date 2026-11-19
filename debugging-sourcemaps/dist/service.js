"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCalculation = runCalculation;
const compute_1 = require("./compute");
async function runCalculation(input) {
    console.log("[service] Iniciando cálculo...");
    const result = await (0, compute_1.compute)(input);
    console.log("[service] Cálculo concluído:", result);
    return result;
}
//# sourceMappingURL=service.js.map