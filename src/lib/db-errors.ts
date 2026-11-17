/** Whether a database error is a unique violation, optionally on one constraint. */
export function isUniqueViolation(error: unknown, constraint?: string): boolean {
  for (let e: unknown = error; e; e = (e as { cause?: unknown }).cause) {
    const { code, constraint: name, message } = e as {
      code?: string;
      constraint?: string;
      message?: string;
    };
    if (code === "23505" || message?.includes("duplicate key")) {
      return !constraint || name === constraint || Boolean(message?.includes(constraint));
    }
  }
  return false;
}
