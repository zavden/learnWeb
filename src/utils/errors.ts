// Helpers for values caught by `catch`, which TypeScript types as `unknown`.

/** The message of a caught value: `error.message` for errors and error-like objects, its string form otherwise. */
export function errorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return String(error);
}
