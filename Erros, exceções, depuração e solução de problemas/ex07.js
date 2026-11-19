
class InvalidAgeError extends Error {
    constructor(message, options = {}) {
        super(message, options);

        this.name = "InvalidAgeError";
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            cause: this.cause ? {
                name: this.cause.name,
                message: this.cause.message
            } : null
        };
    }
}

class ValidationError extends Error {
    constructor(message, errors = [], options = {}) {
        super(message, options);

        this.name = "ValidationError";
        this.errors = errors;
    }

    flatten() {
        return this.errors.map(error => {
            return `${error.path}: ${error.message}`;
        });
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            errors: this.flatten(),
            cause: this.cause ? {
                name: this.cause.name,
                message: this.cause.message
            } : null
        };
    }
}

module.exports = {
    InvalidAgeError,
    ValidationError
};
