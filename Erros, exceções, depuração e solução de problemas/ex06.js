
async function withResource(fn, cleanup = async (handle) => {
    handle.closed = true;
}) {
    const handle = { closed: false };
    let originalError = null;

    try {
        return await fn(handle);

    } catch (error) {
        originalError = error;

        throw error;

    } finally {
        try {
            await cleanup(handle);

            handle.closed = true;

        } catch (cleanupError) {

            if (originalError) {
                // Preserva o erro principal
                originalError.suppressed = [
                    ...(originalError.suppressed || []),
                    cleanupError
                ];

                console.error(
                    "Erro durante o cleanup:",
                    cleanupError.stack
                );

            } else {
                // Se não houve erro principal,
                // o erro do cleanup será lançado.
                throw cleanupError;
            }
        }
    }
}

module.exports = { withResource };
