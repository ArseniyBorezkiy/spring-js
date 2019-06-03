import {
  TWishedBean,
  TBeanDefinition
} from "../org.springframework.beans/annotations";
import { AbstractBeanFactory } from "../org.springframework.beans/abstractBeanFactory";
import { ApplicationEvent } from "./applicationEvent";
import { AbstractApplicationContext } from "./abstractApplicationContext";
import { ApplicationContextBeanRuntimeExceptionEvent } from "./applicationContextEvent";
import { IApplicationContextAware } from "./applicationContext";

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
// Interfaces
//

export interface IThrowable extends IApplicationContextAware {}

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
    throw new Error("[@Bean]: incorrect bean definition params");
  }

  return function(constructor) {
    const beanDefinition: TBeanDefinition<any> = {
      token,
      factory: constructor,
      scope: params.scope,
      resolver: params.resolver,
      configuration: false
    };

    // register additional bean
    const beanDefinitions =
      Reflect.getMetadata(beansToken, AbstractBeanFactory) || [];
    Reflect.defineMetadata(
      beansToken,
      [...beanDefinitions, beanDefinition],
      AbstractBeanFactory
    );
  };
}

//
// @Configuration
//

export function Configuration(token: Symbol, params?: TBeanParams) {
  params = params || {};
  params.scope = params.scope == null ? "singleton" : params.scope;

  // checks params
  if (
    !token ||
    (params.scope !== "singleton" &&
      params.scope !== "global" &&
      params.scope !== "prototype")
  ) {
    throw new Error("[@Configuration]: incorrect bean definition params");
  }

  return function(constructor) {
    const beanDefinition: TBeanDefinition<any> = {
      token,
      factory: constructor,
      scope: params.scope,
      resolver: params.resolver,
      configuration: true
    };

    // register additional bean
    const beanDefinitions =
      Reflect.getMetadata(beansToken, AbstractBeanFactory) || [];
    Reflect.defineMetadata(
      beansToken,
      [...beanDefinitions, beanDefinition],
      AbstractBeanFactory
    );
  };
}

//
// @bean
//

export function bean(token: Symbol, params?: TBeanParams) {
  params = params || {};
  params.scope = params.scope == null ? "singleton" : params.scope;

  // checks params
  if (
    !token ||
    (params.scope !== "singleton" &&
      params.scope !== "global" &&
      params.scope !== "prototype")
  ) {
    throw new Error("[@bean]: incorrect bean definition params");
  }

  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const destination = target.constructor;

    const beanDefinition: TBeanDefinition<any> = {
      token,
      factory: null,
      factoryProperty: propertyKey,
      scope: params.scope,
      resolver: params.resolver
    };

    // register additional bean
    const beanDefinitions = Reflect.getMetadata(beansToken, destination) || [];
    Reflect.defineMetadata(
      beansToken,
      [...beanDefinitions, beanDefinition],
      destination
    );
  };
}

//
// @EventListener
//

export function EventListener(eventClass: typeof ApplicationEvent) {
  return function(target, key, descriptor) {
    const destination = target.constructor;

    const eventListeners = Reflect.getMetadata(eventsToken, destination) || [];
    Reflect.defineMetadata(
      eventsToken,
      [...eventListeners, { key, eventClass } as TEventListenerRecord],
      destination
    );
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
