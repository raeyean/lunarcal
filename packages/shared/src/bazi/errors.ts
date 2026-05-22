export type BaziErrorCode = 'INVALID_DATE' | 'INVALID_TIME' | 'ENGINE_FAILURE';

export class BaziError extends Error {
  public readonly code: BaziErrorCode;

  constructor(code: BaziErrorCode, message: string) {
    super(message);
    this.name = 'BaziError';
    this.code = code;
    // restore prototype chain for instanceof checks across transpile targets
    Object.setPrototypeOf(this, BaziError.prototype);
  }
}
