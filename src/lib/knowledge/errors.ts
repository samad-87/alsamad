/** Thrown by the knowledge entity constructors when a required invariant is violated. */
export class KnowledgeEntityError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "KnowledgeEntityError";
  }
}
