import { ICloseable, Exception } from "../java";
import { preDestroyHooksToken, postConstructHooksToken } from "../javax";
import { disposableToken } from "../rxjava";
import { beansToken } from "../org.springframework.context/annotations";
import { ILifecycle } from "../org.springframework.context/lifecycle";
import {
  TWishedBean,
  TBeanDefinition,
  dependenciesToken,
  TAutowire
} from "./annotations";
import { FactoryBean } from "./factoryBean";
import { TWishedBeanOrFactory, IBeanFactory, IResolver } from "./factory";

//
// Types
//

const emptyMap = new Map<any, TWishedBeanOrFactory>();

//
// BeanFactory is a Ioc container
//

export abstract class AbstractBeanFactory
  implements IBeanFactory, ILifecycle, ICloseable {
  public beansMap: Map<any, any>;
  public beanPathMap: Map<any, any>;
  protected parentBeanFactory: AbstractBeanFactory;
  protected running = false;

  static beansMap: Map<any, any> = new Map();

  /* constructor */
  constructor() {
    this.beansMap = new Map();
    this.beanPathMap = new Map();
    this.parentBeanFactory = null;
  }

  // retrieve instantiated bean from cache
  public findSingletonInstance(key: any) {
    if (this.beansMap.has(key)) {
      return this.beansMap.get(key);
    }

    if (this.parentBeanFactory) {
      return this.parentBeanFactory.findSingletonInstance(key);
    }

    return null;
  }

  // retrieve instantiated bean from cache
  private findGlobalInstance(key: any) {
    if (AbstractBeanFactory.beansMap.has(key)) {
      return AbstractBeanFactory.beansMap.get(key);
    }

    return null;
  }

  public set(key: Symbol, value: TWishedBeanOrFactory) {
    this.beanPathMap.set(key, value);
  }

  // set bean map
  public configure(beanPathMap: Map<any, TWishedBeanOrFactory>) {
    for (const key of beanPathMap.keys()) {
      this.beanPathMap.set(key, beanPathMap.get(key));
    }
  }

  // proxy wished beans to specified context
  public inherit(context: AbstractBeanFactory, wishedBeans: TWishedBean[]) {
    for (const whishedBean of wishedBeans) {
      this.beanPathMap.set(
        whishedBean,
        FactoryBean.of(() => context.getBean(whishedBean))
      );
    }
  }

  // proxy all not found beans to specified context
  public setParent(context: AbstractBeanFactory) {
    this.parentBeanFactory = context;
  }

  // execute all disposers in bean
  public disposeBean(instance) {
    let key;
    let value;
    for (const entry of this.beansMap.entries()) {
      if (entry[1] === instance) {
        key = entry[0];
        value = entry[1];
        break;
      }
    }

    if (!key) {
      throw new Exception("disposeBean: No such bean instance");
    }

    const bean = value;
    if (Reflect.hasMetadata(disposableToken, bean.constructor)) {
      const disposerKeys = Reflect.getMetadata(
        disposableToken,
        bean.constructor
      );
      disposerKeys.forEach(disposerKey => {
        if (bean[disposerKey] && bean[disposerKey] instanceof Function) {
          bean[disposerKey].call(bean);
          bean[disposerKey] = null;
        }
      });
    }
  }

  // destroy specified bean
  public destroyBean(instance) {
    let key;
    let value;
    for (const entry of this.beansMap.entries()) {
      if (entry[1] === instance) {
        key = entry[0];
        value = entry[1];
        break;
      }
    }

    if (!key) {
      throw new Exception("destroyBean: No such bean instance");
    }

    const bean = value;

    this.disposeBean(bean);

    if (Reflect.hasMetadata(preDestroyHooksToken, bean.constructor)) {
      const preDestroyHook = Reflect.getMetadata(
        preDestroyHooksToken,
        bean.constructor
      );
      bean[preDestroyHook].call(bean);
    }

    this.beansMap.delete(key);
  }

  // instantiate bean or retrieve it from cache
  public getBean<T>(
    wishedBean: TWishedBeanOrFactory | T,
    required: boolean = true,
    extraBeanPathMap: Map<any, TWishedBeanOrFactory> = null
  ): T | null {
    extraBeanPathMap = extraBeanPathMap || emptyMap;

    if (wishedBean == null) {
      throw new Exception(`getBean: "wishedBean" should be not null`);
    }

    // 1. resolve string path
    if (typeof wishedBean === "string") {
      // 1.1. resolve string path to either another string path or symbol token
      const nextWishedBean = this.resolveBean<T>(wishedBean, extraBeanPathMap);
      // 1.2. try again until get symbol token
      return this.getBean<T>(nextWishedBean, required, extraBeanPathMap);
    }

    // 2. get bean by symbol token
    if (typeof wishedBean === "symbol") {
      // 2.1 search in instances
      if (this.beansMap.has(wishedBean)) {
        return this.beansMap.get(wishedBean);
      }

      // 2.2. resolve symbol token to another token
      if (
        !this.beanPathMap.has(wishedBean) &&
        !extraBeanPathMap.has(wishedBean)
      ) {
        if (this.parentBeanFactory) {
          // 2.2.1. resolve in parents
          const newWishedBean = this.resolveBean<T>(
            wishedBean,
            extraBeanPathMap
          );
          if (!newWishedBean) {
            // 2.2.1.1. instantiate by token because parents not awared about this token
            return this.getBeanByToken<T>(
              wishedBean,
              required,
              extraBeanPathMap
            );
          } else {
            // 2.2.1.2. try get again with new path that was resolved in parents
            return this.getBean<T>(newWishedBean, required, extraBeanPathMap);
          }
        } else {
          // 2.2.2. instantiate by token because there is no parents
          return this.getBeanByToken<T>(wishedBean, required, extraBeanPathMap);
        }
      }

      // 2.3. resolve in itself
      const nextWishedBean = this.resolveBean<T>(wishedBean, extraBeanPathMap);
      // 2.4. try get again with new path that was resolved by itself
      return this.getBean<T>(nextWishedBean, required, extraBeanPathMap);
    }

    // 3. get bean by factory
    if (wishedBean instanceof FactoryBean) {
      const beanFactory = wishedBean as FactoryBean<T>;
      return beanFactory.factory();
    }

    // 4. bean is resolved from instances
    return wishedBean as any;
  }

  public resolveBean<T>(
    wishedBean: TWishedBean,
    extraBeanPathMap: Map<any, TWishedBeanOrFactory> = null
  ): TWishedBeanOrFactory {
    extraBeanPathMap = extraBeanPathMap || emptyMap;

    // 1. search in instances
    if (this.beansMap.has(wishedBean)) {
      return this.beansMap.get(wishedBean);
    }

    // 2. search bean path mapping in itself
    if (
      !this.beanPathMap.has(wishedBean) &&
      !extraBeanPathMap.has(wishedBean)
    ) {
      // 2.1. search bean path mapping in parents
      if (this.parentBeanFactory) {
        return this.parentBeanFactory.resolveBean<T>(
          wishedBean,
          extraBeanPathMap
        );
      }

      // 2.2. not resolved
      return null;
    }

    // 3. retrieve path mapping from itself
    if (this.beanPathMap.has(wishedBean)) {
      return this.beanPathMap.get(wishedBean);
    } else {
      return extraBeanPathMap.get(wishedBean);
    }
  }

  private getBeanByToken<T>(
    token: Symbol,
    required: boolean,
    extraBeanPathMap: Map<any, TWishedBeanOrFactory>
  ): T | null {
    // 1. check beans definitions exists in package
    if (!Reflect.hasMetadata(beansToken, AbstractBeanFactory)) {
      throw new Exception(`getBeanByToken: No beans found in class Context`);
    }

    // 2. find bean definition by type
    const beanDefenitions: TBeanDefinition<T>[] = Reflect.getMetadata(
      beansToken,
      AbstractBeanFactory
    );
    const beanDefenition: TBeanDefinition<T> = beanDefenitions.find(
      (beanDefenition: TBeanDefinition<T>) => beanDefenition.token === token
    ) as TBeanDefinition<T>;

    if (!beanDefenition) {
      if (required) {
        console.log("Symbol caused error", token);
        throw new Exception(
          `getBeanByToken: Bean with token not provided in Context`
        );
      }

      return null;
    }

    if (beanDefenition.factory == null) {
      throw new Exception(
        `getBeanByToken: Bean definition should have factory "${beanDefenition}"`
      );
    }

    // 3. get instance
    let bean: T;
    if (beanDefenition.scope === "singleton") {
      bean = this.findSingletonInstance(beanDefenition.token);
      if (!bean) {
        // instantiate
        const type = beanDefenition.factory.prototype;
        bean = new type.constructor(this);
        this.beansMap.set(beanDefenition.token, bean);
        this.autowire<T>(bean, beanDefenition, extraBeanPathMap);
      }
    } else if (beanDefenition.scope === "global") {
      bean = this.findGlobalInstance(beanDefenition.token);
      if (!bean) {
        // instantiate
        const type = beanDefenition.factory.prototype;
        bean = new type.constructor(this);
        AbstractBeanFactory.beansMap.set(beanDefenition.token, bean);
        this.autowire<T>(bean, beanDefenition, extraBeanPathMap);
      }
    } else if (beanDefenition.scope === "prototype") {
      // instantiate
      const type = beanDefenition.factory.prototype;
      bean = new type.constructor(this);
      this.beansMap.set(Symbol(), bean);
      this.autowire<T>(bean, beanDefenition, extraBeanPathMap);
    } else {
      throw new Exception(
        `getBeanByToken: Unsupported scope ${beanDefenition.scope}`
      );
    }

    // 4. call post construct hook
    if (Reflect.hasMetadata(postConstructHooksToken, bean.constructor)) {
      const postConstructHook = Reflect.getMetadata(
        postConstructHooksToken,
        bean.constructor
      );
      bean[postConstructHook].call(bean);
    }

    return bean;
  }

  private autowire<T>(
    bean: T,
    beanDefenition: TBeanDefinition<T>,
    extraBeanPathMap: Map<any, TWishedBeanOrFactory>
  ) {
    if (bean.constructor == null) {
      throw new Exception(
        `autowire: Trying inject dependencies to not a bean (no constructor) "${bean}"`
      );
    }

    if (Reflect.hasMetadata(dependenciesToken, bean.constructor)) {
      const dependencies: TAutowire[] = Reflect.getMetadata(
        dependenciesToken,
        bean.constructor
      ) as TAutowire[];
      for (const dependency of dependencies) {
        // check property is empty
        const propertyName = dependency.property;
        const propertyValue = bean[propertyName];
        if (!propertyValue) {
          if (dependency.wishedBean == null) {
            throw new Exception(
              `autowire: Wished bean should not be null in dependency defenition for property "${
                dependency.property
              }"`
            );
          }
          if (dependency.resolve) {
            const resolverPath = beanDefenition.resolver;
            const resolverBean: IResolver<T> = this.getBean(
              resolverPath,
              true,
              extraBeanPathMap
            );
            const resolvedArray = resolverBean.resolve(
              dependency.resolve,
              bean
            );
            if (resolvedArray) {
              const resolverMap = new Map<any, any>(resolvedArray);
              extraBeanPathMap.forEach((v, k) => resolverMap.set(k, v));
              extraBeanPathMap = resolverMap;
            }
          }
          bean[propertyName] = this.getBean(
            dependency.wishedBean,
            dependency.required,
            extraBeanPathMap
          );
        } else {
          throw new Exception(
            `autowire: Autowired property "${
              dependency.property
            }" should be null but got "${propertyValue}"`
          );
        }
      }
    }
  }

  //
  // ICloseable implementation
  //

  public close() {
    if (this.isRunning()) {
      this.stop();
    }
    this.beanPathMap = null;
    this.beansMap = null;
  }

  //
  // ILifecycle implementation
  //

  public start() {
    if (!this.isRunning()) {
      if (this.beanPathMap && this.beansMap) {
        this.running = true;
      } else {
        throw new Exception("Bean factory has not configured");
      }
    } else {
      throw new Exception("Bean factory already has started");
    }
  }

  public stop() {
    if (this.isRunning()) {
      const disposeBeansKeys = this.beansMap.keys();
      for (const key of disposeBeansKeys) {
        const bean = this.beansMap.get(key);
        this.disposeBean(bean);
      }
      const destroyBeansKeys = this.beansMap.keys();
      for (const key of destroyBeansKeys) {
        const bean = this.beansMap.get(key);
        this.destroyBean(bean);
      }
      this.running = false;
    } else {
      throw new Exception("Bean factory has not started");
    }
  }

  public isRunning(): boolean {
    return this.running;
  }
}
