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

/**
 * Params for Bean annotation
 */
export type TBeanParams = {
  scope?: TScope;
  resolver?: TWishedBean;
};

/**
 * Definition of the event listener for EventListener annotation
 */
export type TEventListenerRecord = {
  key: string;
  eventClass: typeof ApplicationEvent;
};

export const beansToken = Symbol();
export const eventsToken = Symbol();

//
// Interfaces
//

/**
 * Annotation for classes contains Throwable annotated methods
 */
export interface IThrowable extends IApplicationContextAware {}

//
// Scope
//

export type TScope = "singleton" | "global" | "prototype";

//
// @Bean
//

/**
 * Mark class be managed by context.
 * @remark https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Component.html
 * @param token - bean token to comply bean instance.
 * @param params - bean params (scope).
 */
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

/**
 * Mark class as configuration bean.
 * Allows to use bean annotation for methods.
 * @remark https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/Configuration.html
 * @param token
 * @param params
 */
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

/**
 * Mark method as factory to provide bean.
 * @remark https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/Bean.html
 * @param token - token to comply bean instance.
 * @param params - bean params (scope).
 */
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

/**
 * Subscribe for events in context.
 * @remark https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/context/event/EventListener.html
 * @param eventClass - event type to subscribe
 */
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

/**
 * All errors in method will be broadcasted to context as ApplicationContextBeanRuntimeExceptionEvent.
 * For sync function.
 * @param context - context to broadcast exceptions
 */
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

/**
 * All errors in method will be broadcasted to context as ApplicationContextBeanRuntimeExceptionEvent.
 * For async function.
 * @param context - context to broadcast exceptions
 */
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
