//
// Factory for providing beans
//

/**
 * Calculted value wrapped as bean.
 * @remark https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/beans/factory/FactoryBean.html
 */
export class FactoryBean<T> {
  constructor(public factory: () => T) {}

  static of<T>(factory: () => T): FactoryBean<T> {
    return new FactoryBean(factory);
  }
}
