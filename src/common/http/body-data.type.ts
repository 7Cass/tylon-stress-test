// Typing-only contract for request bodies.
// We do not change runtime payloads; we only reuse these types in decorators.

export type BodyData<T> = T;
