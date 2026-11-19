/**
 * Calcula um valor a partir de uma entrada numérica em texto.
 * A linha marcada como FALHA INTENCIONAL é o alvo do breakpoint.
 */
export async function compute(input: string): Promise<number> {
    const parsed = Number(input.trim());

    if (!Number.isFinite(parsed)) {
        throw new TypeError("A entrada precisa ser um número válido.");
    }

    if (parsed === 0) {
        // FALHA INTENCIONAL: coloque o breakpoint nesta linha.
        throw new RangeError("Não é possível calcular com divisor igual a zero.");
    }

    const result = 100 / parsed;
    return result;
}
