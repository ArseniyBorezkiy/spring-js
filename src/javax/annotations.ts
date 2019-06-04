import { ITransactionParams } from "./transaction";
import { Exception } from "../java/exception";

//
// Types
//

export type TResource = {
  property: string;
  required: boolean;
  url: string;
};

export type TResourceParams = {
  required?: boolean;
};

export const postConstructHooksToken = Symbol();
export const preDestroyHooksToken = Symbol();
export const transactionalToken = Symbol();
export const resourceDefinitionToken = Symbol();
export const resourceDependenciesToken = Symbol();

export class ResourceHolder {}

//
// @PostConstruct
//

export function PostConstruct(target, key, descriptor) {
  const destination = target.constructor;
  if (!Reflect.hasMetadata(postConstructHooksToken, destination)) {
    Reflect.defineMetadata(postConstructHooksToken, key, destination);
  } else {
    throw new Error("[@PostConstruct]: method already exists");
  }
}

//
// @PreDestroy
//

export function PreDestroy(target, key, descriptor) {
  const destination = target.constructor;
  if (!Reflect.hasMetadata(preDestroyHooksToken, destination)) {
    Reflect.defineMetadata(preDestroyHooksToken, key, destination);
  } else {
    throw new Error("[@PreDestroy]: method already exists");
  }
}

//
// @Transactional
//

export function Transactional(params?: ITransactionParams) {
  return function(target, key, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function() {
      const transactionManager = this.transactionManager;
      let result = null;

      try {
        const transactionParams = { target: this };

        if (params) {
          Object.assign(transactionParams, params);
        }
        
        transactionManager.begin(transactionParams);
        result = originalMethod.apply(this, arguments);
        if (result instanceof Promise) {
          const promise = result;
          promise
            .then(result => {
              transactionManager.commit();
              return result;
            })
            .catch(e => {
              transactionManager.rollback();
              throw e;
            });
        } else {
          transactionManager.commit();
        }
      } catch (e) {
        transactionManager.rollback();
        throw e;
      }

      return result;
    };

    return descriptor;
  };
}

//
// @Resource
//

export function Resource(url: string, params?: TResourceParams) {
  params = params || {};
  params.required = params.required == null ? false : params.required;

  if (url == null) {
    throw new Exception("[@Resource]: url should not be null");
  }

  return function(target, propertyKey: string) {
    const destination = target.constructor;
    const dependencies =
      Reflect.getMetadata(resourceDependenciesToken, destination) || [];
    const resources =
      Reflect.getMetadata(resourceDefinitionToken, destination) || [];

    Reflect.defineMetadata(
      resourceDependenciesToken,
      [
        ...dependencies,
        {
          url,
          property: propertyKey,
          required: params.required
        } as TResource
      ],
      destination
    );

    Reflect.defineMetadata(
      resourceDefinitionToken,
      [
        ...resources,
        {
          url
        } as TResource
      ],
      destination
    );
  };
}
