/** Form-level outcome: errors are announced at once, successes politely. */
export function FormMessage({ error, success }: { error?: string; success?: string }) {
  return (
    <div aria-live="polite">
      {error ? (
        <p role="alert" className="border-l-2 border-error pl-3 text-sm text-error">
          {error}
        </p>
      ) : success ? (
        <p className="animate-fade-up border-l-2 border-success pl-3 text-sm text-success">
          {success}
        </p>
      ) : null}
    </div>
  );
}
