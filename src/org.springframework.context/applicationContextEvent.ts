import { ApplicationEvent } from "./applicationEvent";
import { IApplicationContext } from "./applicationContext";

/**
 * Base class for events raised for an ApplicationContext.
 * @remark https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/context/event/ApplicationContextEvent.html
 */
export abstract class ApplicationContextEvent extends ApplicationEvent {
  public source: IApplicationContext;

  constructor(source: IApplicationContext) {
    super();
    this.source = source;
  }
}

/**
 * Event fired when context started and ready to work.
 * @remark https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/context/event/ContextStartedEvent.html
 */
export class ApplicationContextStartEvent extends ApplicationContextEvent {}

/**
 * Event fired when context stopped and all beans destroyed.
 * @remark https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/event/package-summary.html
 */
export class ApplicationContextStopEvent extends ApplicationContextEvent {}

/**
 * Event fired when exception catched in throwable-annotated function of bean.
 * @remark https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/BeansException.html
 */
export class ApplicationContextBeanRuntimeExceptionEvent extends ApplicationContextEvent {
  public exception: Error;

  constructor(source: IApplicationContext, exception: Error) {
    super(source);
    this.exception = exception;
  }
}
