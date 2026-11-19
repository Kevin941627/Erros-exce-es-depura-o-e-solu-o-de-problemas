import { compute } from "./compute";

export async function runCalculation(input: string): Promise<number> {
    console.log("[service] Iniciando cálculo...");
    const result = await compute(input);
    console.log("[service] Cálculo concluído:", result);
    return result;
}
