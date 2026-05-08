export class DashboardRuntimeError extends Error {
  constructor(
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "DashboardRuntimeError";
  }
}

export class RefResolutionError extends DashboardRuntimeError {
  constructor(ref: string) {
    super(`Ref not found: ${ref}`, { ref });
    this.name = "RefResolutionError";
  }
}
