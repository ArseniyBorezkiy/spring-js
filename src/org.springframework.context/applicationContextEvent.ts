import { ApplicationEvent } from "./applicationEvent";
import { IApplicationContext } from "./applicationContext";

export abstract class ApplicationContextEvent extends ApplicationEvent {
  public source: IApplicationContext;

  constructor(source: IApplicationContext) {
    super();
    this.source = source;
  }
}

export class ApplicationContextStartEvent extends ApplicationContextEvent {}

export class ApplicationContextStopEvent extends ApplicationContextEvent {}

export class ApplicationContextBeanRuntimeExceptionEvent extends ApplicationContextEvent {
  public exception: Error;

  constructor(source: IApplicationContext, exception: Error) {
    super(source);
    this.exception = exception;
  }
}
