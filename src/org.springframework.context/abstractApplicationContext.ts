import { Exception } from "../java/exception";
import { AbstractBeanFactory } from "../org.springframework.beans/abstractBeanFactory";
import { ApplicationEvent } from "./applicationEvent";
import { eventsToken, TEventListenerRecord } from "./annotations";
import {
  ApplicationContextStartEvent,
  ApplicationContextStopEvent
} from "./applicationContextEvent";

//
// Context is a Ioc container with event system
//

const PFX = "[ABSTRACT APPLICATION CONTEXT]:";

export class AbstractApplicationContext extends AbstractBeanFactory {
  protected parentBeanFactory: AbstractApplicationContext;

  constructor() {
    super();
    this.parentBeanFactory = null;
  }

  public publishEvent(event: ApplicationEvent) {
    if (this.beansMap) {
      this.beansMap.forEach(bean => {
        if (Reflect.hasMetadata(eventsToken, bean.constructor)) {
          const eventListenerRecords = Reflect.getMetadata(
            eventsToken,
            bean.constructor
          );
          eventListenerRecords.forEach((record: TEventListenerRecord) => {
            if (event instanceof record.eventClass) {
              bean[record.key].call(bean, event);
            }
          });
        }
      });
    } else {
      throw new Exception(
        `${PFX} could not publish event - context not started`
      );
    }

    // broadcast to parent contexts
    if (this.parentBeanFactory && this.parentBeanFactory.isRunning()) {
      this.parentBeanFactory.publishEvent(event);
    }
  }

  //
  // ILifecycle implementation
  //

  public start() {
    super.start();
    this.publishEvent(new ApplicationContextStartEvent(this));
  }

  public stop() {
    this.publishEvent(new ApplicationContextStopEvent(this));
    super.stop();
  }

  public close() {
    super.close();
  }

  //
  // Overrides
  //

  public async getResource(url: string): Promise<string> {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
}
