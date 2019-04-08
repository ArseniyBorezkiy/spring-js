import { TWishedBean } from "./annotations";
import { FactoryBean } from "./factoryBean";

//
// Types
//

export interface IResolver<T> {
  resolve(path: TWishedBean, bean: T): any[] | null;
}

export type TWishedBeanOrFactory = TWishedBean | FactoryBean<any>;

//
// IBeanFactory
//

export interface IBeanFactory {
  getBean<T>(
    wishedBean: TWishedBeanOrFactory | T,
    required?: boolean,
    extraBeanPathMap?: Map<any, TWishedBeanOrFactory>
  ): T | null;

  set(key: Symbol, value: TWishedBeanOrFactory);
}
