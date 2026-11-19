
class TimeoutError extends Error {
    constructor(message = "A requisição excedeu o tempo limite.") {
        super(message);
        this.name = "TimeoutError";
    }
}

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

async function safeFetchJson(url, options = {}) {
    const {
        timeout = 5000,
        retries = 3,
        backoffMs = 300,
        signal: externalSignal,
        fetchImpl = globalThis.fetch,
        ...fetchOptions
    } = options;

    if (typeof fetchImpl !== "function") {
        throw new Error("Fetch não está disponível.");
    }

    if (externalSignal?.aborted) {
        throw externalSignal.reason ??
            new DOMException("Operação cancelada", "AbortError");
    }

    const maxAttempts = Math.min(
        3,
        Math.max(1, retries)
    );

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const controller = new AbortController();
        let timedOut = false;

        const onExternalAbort = () => {
            controller.abort(
                externalSignal.reason ??
                new DOMException("Operação cancelada", "AbortError")
            );
        };

        externalSignal?.addEventListener(
            "abort",
            onExternalAbort,
            { once: true }
        );

        const timer = setTimeout(() => {
            timedOut = true;
            controller.abort(new TimeoutError());
        }, timeout);

        try {
            const response = await fetchImpl(url, {
                ...fetchOptions,
                signal: controller.signal
            });

            if (!response.ok) {
                throw new HttpError(
                    response.status,
                    `Erro HTTP: ${response.status}`
                );
            }

            // JSON inválido gera SyntaxError.
            return await response.json();

        } catch (error) {
            if (timedOut) {
                throw new TimeoutError();
            }

            if (externalSignal?.aborted) {
                throw externalSignal.reason ??
                    new DOMException("Operação cancelada", "AbortError");
            }

            // Erros HTTP e de parsing não recebem retry.
            if (error instanceof HttpError ||
                error instanceof SyntaxError) {
                throw error;
            }

            // Somente erros de rede do fetch são repetidos.
            if (!(error instanceof TypeError)) {
                throw error;
            }

            if (attempt === maxAttempts) {
                throw error;
            }

            const delay = backoffMs * (2 ** (attempt - 1));

            await new Promise((resolve, reject) => {
                const timer = setTimeout(resolve, delay);

                const cancel = () => {
                    clearTimeout(timer);
                    reject(
                        externalSignal.reason ??
                        new DOMException(
                            "Operação cancelada",
                            "AbortError"
                        )
                    );
                };

                if (externalSignal?.aborted) {
                    cancel();
                } else {
                    externalSignal?.addEventListener(
                        "abort",
                        cancel,
                        { once: true }
                    );
                }
            }).finally(() => {
                externalSignal?.removeEventListener(
                    "abort",
                    () => {}
                );
            });

        } finally {
            clearTimeout(timer);
            externalSignal?.removeEventListener(
                "abort",
                onExternalAbort
            );
        }
    }
}

module.exports = {
    safeFetchJson,
    TimeoutError,
    HttpError
};
