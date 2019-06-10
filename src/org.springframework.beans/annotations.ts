import { Exception } from "../java/exception";
import { TScope } from "../org.springframework.context/annotations";

//
// Types
//

/**
 * Bean name or token to comply with.
 * Abstract token can be mapped to bean associated token or bean name.
 * Bean name can be mapped to bean name or bean associated token.
 */
export type TWishedBean = string | Symbol;

/**
 * Params for Autowired annotation
 */
export type TAutowiredParams = {
  required?: boolean;
  resolve?: TWishedBean;
};

/**
 * Definition of autowired-marked field
 */
export type TAutowire = {
  property: string;
  wishedBean: any;
  required: boolean;
  resolve?: TWishedBean;
};

/**
 * Definition of bean
 */
export type TBeanDefinition<T> = {
  token: Symbol;
  factory: new () => T;
  factoryProperty?: string;
  scope: TScope;
  resolver: TWishedBean;
  configuration?: boolean;
  bean?: any;
};

export const dependenciesToken = Symbol();

//
// @Autowired
//

/**
 * Inject field (instantiating if needed dependencies).
 * Allowing scopes (prototype, singleton, global).
 * @remark https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/annotation/Autowired.html
 * @param wishedBean - bean name or token.
 * @param params - params (required, scope, etc).
 */
export function Autowired(wishedBean: TWishedBean, params?: TAutowiredParams) {
  params = params || {};
  params.required = params.required == null ? false : params.required;

  if (wishedBean == null) {
    throw new Exception("[@Autowired]: wished bean should not be null");
  }

  return function(target, propertyKey: string) {
    const destination = target.constructor;
    const dependencies =
      Reflect.getMetadata(dependenciesToken, destination) || [];

    Reflect.defineMetadata(
      dependenciesToken,
      [
        ...dependencies,
        {
          property: propertyKey,
          wishedBean,
          required: params.required,
          resolve: params.resolve
        } as TAutowire
      ],
      destination
    );
  };
}
