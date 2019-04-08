import { ITransactionParams } from "./transaction";

//
// Types
//

export const postConstructHooksToken = Symbol();
export const preDestroyHooksToken = Symbol();
export const transactionalToken = Symbol();

//
// @PostConstruct
//

export function PostConstruct(target, key, descriptor) {
  const destination = target.constructor;
  if (!Reflect.hasMetadata(postConstructHooksToken, destination)) {
    Reflect.defineMetadata(postConstructHooksToken, key, destination);
  } else {
    throw new Error("Post construct method already exists");
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
    throw new Error("Pre destroy method already exists");
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
        transactionManager.begin(params);
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
