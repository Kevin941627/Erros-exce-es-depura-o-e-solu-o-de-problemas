
class ValidationError extends Error {
    constructor(errors) {
        super("Foram encontrados erros de validação.");
        this.name = "ValidationError";
        this.errors = errors;
    }
}

function validatePayload(payload, schema) {
    const errors = [];

    function validate(value, rules, path) {
        // Campo ausente
        if (value === undefined) {
            if (rules.required) {
                errors.push({
                    path,
                    expected: rules.type,
                    received: "undefined",
                    message: `O campo '${path}' é obrigatório.`
                });
            }
            return;
        }

        // Verificação de tipos
        if (rules.type === "array") {
            if (!Array.isArray(value)) {
                errors.push({
                    path,
                    expected: "array",
                    received: typeof value,
                    message: `O campo '${path}' deve ser um array.`
                });
                return;
            }

            value.forEach((item, index) => {
                validate(item, rules.items, `${path}[${index}]`);
            });

            return;
        }

        if (rules.type === "object") {
            if (
                typeof value !== "object" ||
                value === null ||
                Array.isArray(value)
            ) {
                errors.push({
                    path,
                    expected: "object",
                    received: value === null ? "null" : typeof value,
                    message: `O campo '${path}' deve ser um objeto.`
                });
                return;
            }

            // Verifica campos extras
            for (const key of Object.keys(value)) {
                if (!rules.properties[key]) {
                    errors.push({
                        path: `${path}.${key}`,
                        expected: "nenhum campo extra",
                        received: typeof value[key],
                        message: `O campo '${path}.${key}' não é permitido.`
                    });
                }
            }

            // Valida propriedades
            for (const key of Object.keys(rules.properties)) {
                validate(
                    value[key],
                    rules.properties[key],
                    `${path}.${key}`
                );
            }

            return;
        }

        if (typeof value !== rules.type) {
            errors.push({
                path,
                expected: rules.type,
                received: typeof value,
                message: `O campo '${path}' deveria ser ${rules.type}.`
            });
            return;
        }

        // Verificação de intervalo numérico
        if (rules.type === "number") {
            if (rules.min !== undefined && value < rules.min) {
                errors.push({
                    path,
                    expected: `mínimo ${rules.min}`,
                    received: value,
                    message: `O campo '${path}' está abaixo do mínimo.`
                });
            }

            if (rules.max !== undefined && value > rules.max) {
                errors.push({
                    path,
                    expected: `máximo ${rules.max}`,
                    received: value,
                    message: `O campo '${path}' está acima do máximo.`
                });
            }
        }
    }

    validate(payload, schema, "payload");

    if (errors.length > 0) {
        throw new ValidationError(errors);
    }

    return true;
}

module.exports = { validatePayload, ValidationError };



const schema = {
    type: "object",
    required: true,
    properties: {
        user: {
            type: "object",
            required: true,
            properties: {
                name: {
                    type: "string",
                    required: true
                },
                age: {
                    type: "number",
                    required: true,
                    min: 18,
                    max: 100
                },
                address: {
                    type: "object",
                    required: true,
                    properties: {
                        zip: {
                            type: "string",
                            required: true
                        }
                    }
                },
                skills: {
                    type: "array",
                    required: true,
                    items: {
                        type: "string"
                    }
                }
            }
        }
    }
};

