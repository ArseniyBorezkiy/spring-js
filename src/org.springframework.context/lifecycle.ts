export interface ILifecycle {
  isRunning(): boolean;
  start(): void;
  stop(): void;
}
