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

/**
 * The root interface for accessing a Spring bean container.
 * @remark https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/BeanFactory.html
 */
export interface IBeanFactory {
  /**
   * Retrieve instantiated bean fron context.
   * @param wishedBean - bean name or token to search.
   * @param required - throw exception if bean not found or not instantiated.
   * @param extraBeanPathMap - extends context search bean mapping.
   * @param debug - show beans names list to console.
   * @throws {Exception} - if bean is not exists or could not resolve name or token to bean comply with.
   */
  getCachedBean<T>(
    wishedBean: TWishedBeanOrFactory | T,
    required?: boolean,
    extraBeanPathMap?: Map<any, TWishedBeanOrFactory>,
    debug?: boolean
  ): T | null;

  /**
   * Instantiate bean in context or retrieve it if exists.
   * @param wishedBean - bean name or token to search.
   * @param required - throw exception if bean not found or not instantiated.
   * @param extraBeanPathMap - extends context search bean mapping.
   * @param debug - show beans names list to console.
   * @throws {Exception} - when could not resolve name or token to bean comply with.
   */
  getBean<T>(
    wishedBean: TWishedBeanOrFactory | T,
    required?: boolean,
    extraBeanPathMap?: Map<any, TWishedBeanOrFactory>,
    debug?: boolean
  ): Promise<T | null>;

  /**
   * Map bean token to bean name or token or factory bean.
   * @param key - bean token.
   * @param value - bean name, token or factory bean.
   */
  set(key: Symbol, value: TWishedBeanOrFactory);
}
