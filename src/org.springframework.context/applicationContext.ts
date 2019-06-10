import { IBeanFactory } from "../org.springframework.beans";
import { ApplicationEvent } from ".";

/**
 * Central interface to provide configuration for an application.
 * @remark https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/ApplicationContext.html
 */
export interface IApplicationContext extends IBeanFactory {
  /**
   * Broadcast event in context and it's parent contexts
   * @param event - event to broadcast
   */
  publishEvent(event: ApplicationEvent): void;
}

/**
 * Interface to be implemented by any object that wishes to be notified of the ApplicationContext that it runs in.
 * @remark https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/ApplicationContextAware.html
 */
export interface IApplicationContextAware {
  context?: IApplicationContext;
}
