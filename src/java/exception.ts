/**
 * Basic class for exceptions.
 * @remark https://docs.oracle.com/javase/7/docs/api/java/lang/Exception.html
 */
export class Exception {
  constructor(public message?: string) {}

  public toString() {
    return this.message;
  }
}
