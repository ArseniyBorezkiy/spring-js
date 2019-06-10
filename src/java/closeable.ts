/**
 * Something that may be closed.
 * @remark https://docs.oracle.com/javase/7/docs/api/java/io/Closeable.html
 */
export interface ICloseable {
  close(): void;
}
