import {
  TWishedBean,
  TBeanDefinition
} from "../org.springframework.beans/annotations";
import { AbstractBeanFactory } from "../org.springframework.beans/abstractBeanFactory";
import { ApplicationEvent } from "./applicationEvent";
import { AbstractApplicationContext } from "./abstractApplicationContext";
import { ApplicationContextBeanRuntimeExceptionEvent } from "./applicationContextEvent";

//
// Types
//

export type TBeanParams = {
  scope?: TScope;
  resolver?: TWishedBean;
};

export type TEventListenerRecord = {
  key: string;
  eventClass: typeof ApplicationEvent;
};

export const beansToken = Symbol();
export const eventsToken = Symbol();

//
// Scope
//

export type TScope = "singleton" | "global" | "prototype";

//
// @Bean
//

export function Bean(token: Symbol, params?: TBeanParams) {
  params = params || {};
  params.scope = params.scope == null ? "singleton" : params.scope;

  // checks params
  if (
    !token ||
    (params.scope !== "singleton" &&
      params.scope !== "global" &&
      params.scope !== "prototype")
  ) {
    throw new Error("Incorrect bean definition params");
  }

  return function(constructor) {
    const beanDefinition: TBeanDefinition<any> = {
      token,
      factory: constructor,
      scope: params.scope,
      resolver: params.resolver
    };
    if (!Reflect.hasMetadata(beansToken, AbstractBeanFactory)) {
      // register first bean
      Reflect.defineMetadata(beansToken, [beanDefinition], AbstractBeanFactory);
    } else {
      // register additional bean
      const beanDefinitions = Reflect.getMetadata(
        beansToken,
        AbstractBeanFactory
      );
      Reflect.defineMetadata(
        beansToken,
        [beanDefinition, ...beanDefinitions],
        AbstractBeanFactory
      );
    }
  };
}

//
// @EventListener
//

export function EventListener(eventClass: typeof ApplicationEvent) {
  return function(target, key, descriptor) {
    const destination = target.constructor;
    if (!Reflect.hasMetadata(eventsToken, destination)) {
      Reflect.defineMetadata(
        eventsToken,
        [{ key, eventClass } as TEventListenerRecord],
        destination
      );
    } else {
      const eventListeners = Reflect.getMetadata(eventsToken, destination);
      Reflect.defineMetadata(
        eventsToken,
        [{ key, eventClass } as TEventListenerRecord, ...eventListeners],
        destination
      );
    }
  };
}

//
// @Throwable
//

export function Throwable(context: AbstractApplicationContext = null) {
  return function(target, key, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function() {
      context = context || this.context;
      let result;
      try {
        result = originalMethod.apply(this, arguments);
      } catch (error) {
        context.publishEvent(
          new ApplicationContextBeanRuntimeExceptionEvent(context, error)
        );

        throw error;
      }

      return result;
    };

    return descriptor;
  };
}

//
// @ThrowableAsync
//

export function ThrowableAsync(context: AbstractApplicationContext = null) {
  return function(target, key, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function() {
      context = context || this.context;
      const result = originalMethod.apply(this, arguments);

      result.catch(error => {
        context.publishEvent(
          new ApplicationContextBeanRuntimeExceptionEvent(context, error)
        );
      });

      return result;
    };

    return descriptor;
  };
}
