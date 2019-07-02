import {
  ITransactionParams,
  ITransaction,
  ITransactionManager,
  ETransactionStatus
} from "./transaction";
import { Exception } from "../java/exception";

//
// Types
//

/**
 * Resource definition for Resource annotation
 * @remark https://docs.oracle.com/javase/7/docs/api/javax/annotation/Resource.html
 */
export type TResource = {
  property: string;
  required: boolean;
  url: string;
};

/**
 * Resource params for Resource annotation
 * @remark https://docs.oracle.com/javase/7/docs/api/javax/annotation/Resource.html
 */
export type TResourceParams = {
  required?: boolean;
};

export const postConstructHooksToken = Symbol();
export const preDestroyHooksToken = Symbol();
export const transactionalToken = Symbol();
export const resourceDefinitionToken = Symbol();
export const resourceDependenciesToken = Symbol();

type ITransactionalParams = {
  target?: any;
};

//
// @PostConstruct
//

/**
 * Bean lifecycle hook.
 * @remark https://docs.oracle.com/javaee/7/api/javax/annotation/PostConstruct.html
 */
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

/**
 * Bean lifecycle hook.
 * @remark https://docs.oracle.com/javaee/7/api/javax/annotation/PreDestroy.html
 */
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

/**
 * Declarative transaction.
 * Opens transaction for first deep level and keep it to deeps calls for transactional-annotated methods.
 * @remark https://docs.oracle.com/javaee/7/api/javax/transaction/Transactional.html
 * @param params - transaction params
 */
export function Transactional(params?: ITransactionalParams) {
  return function(target, key, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const self = this;
      const transactionManager: ITransactionManager<ITransaction> = this
        .transactionManager;
      const transactionParams: ITransactionParams<ITransaction> = {
        target: this,
        operation: originalMethod.apply(self, args)
      };

      if (params) {
        Object.assign(transactionParams, params);
      }

      await transactionManager.begin(transactionParams);

      try {
        await transactionManager.commit();
      } catch (e) {
        await transactionManager.rollback();
        if (
          transactionManager.getTransaction().getStatus() !==
          ETransactionStatus.rollbacked
        ) {
          throw e;
        }
      }
    };

    return descriptor;
  };
}

//
// @Resource
//

/**
 * Autowiring json resource from browser url.
 * At bean instantiation time.
 * @remark https://docs.oracle.com/javase/8/docs/api/javax/annotation/Resource.html
 * @param url - browser url to resource file
 * @param params - resource params
 */
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
