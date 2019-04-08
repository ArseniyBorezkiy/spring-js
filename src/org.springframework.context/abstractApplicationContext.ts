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

export class AbstractApplicationContext extends AbstractBeanFactory {
  protected parentBeanFactory: AbstractApplicationContext;

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
        "AbstractApplicationContext could not publish event now"
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
}
