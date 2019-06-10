/**
 * A common interface defining methods for start/stop lifecycle control.
 * @remark https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/Lifecycle.html
 */
export interface ILifecycle {
  isRunning(): boolean;
  start(): void;
  stop(): void;
}
