import { IBeanFactory } from "../org.springframework.beans";
import { ApplicationEvent } from ".";

export interface IApplicationContext extends IBeanFactory {
  publishEvent(event: ApplicationEvent): void;
}

export interface IApplicationContextAware {
  context?: IApplicationContext;
}
