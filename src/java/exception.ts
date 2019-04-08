export class Exception {
  constructor(public message?: string) {}

  public toString() {
    return this.message;
  }
}
