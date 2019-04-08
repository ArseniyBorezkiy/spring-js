import { IBeanFactory } from "../org.springframework.beans";

export interface IApplicationContext extends IBeanFactory {}

export interface ApplicationContextAware {
  context: IApplicationContext;
}
