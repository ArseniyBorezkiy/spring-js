//
// Factory for providing beans
//

export class FactoryBean<T> {
  constructor(public factory: () => T) {}

  static of<T>(factory: () => T): FactoryBean<T> {
    return new FactoryBean(factory);
  }
}
