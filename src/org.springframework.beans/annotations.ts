import { Exception } from "../java/exception";
import { TScope } from "../org.springframework.context/annotations";

//
// Types
//

export type TWishedBean = string | Symbol;
export type TAutowiredParams = {
  required?: boolean;
  resolve?: TWishedBean;
};

export type TAutowire = {
  property: string;
  wishedBean: any;
  required: boolean;
  resolve?: TWishedBean;
};

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
