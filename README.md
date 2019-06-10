# `spring-js`

## JS/TS IoC in Java Spring style (+ small spring core features).

- Spring Core (IoC) for typescript и javascript.
- Defines Spring Context (IoC + events), Beans terms.
- Support hierarchical contexts with hierarchical event system.
- Support bean scopes (singleton, prototype, global).
- Support beans mappings using tokens (Symbol) and strings (i.e. "bean1").
- Support convinience beans testings using decorators and test context.
- Has many tests and examples in tests folders.
- Has production use in one bank for make complex engine based on PIXI/Konva.

All beans are lazy loaded (by acquiring of @Autowire or beanFactory.getBean()).

If you want to collaborate, write me at arseniiboretskii@gmail.com.
I like Java and I like Spring.
If you know Spring, you know js-beans.
It is also helps Java developers to write frontend code.

## Api reference

https://arseniyborezkiy.github.io/spring-js/

### Source code has similar classes like in Java:

```
src/java
  ICloseable, Exception
src/javax
  @PostConstruct, @PreDestroy, @Transactional, ITransaction
src/rxjava
  @Disposable
src/org.springframework.beans
  @Autowired, AbstractBeanFactory, FactoryBean, IBeanFactory
src/org.springframework.context
  @Bean, @bean, @EventListener, AbstractApplicationContext
  IApplicationContext, IApplicationContextAware, IResourceLoader
src/org.springframework.context
  ApplicationContextEvent, ApplicationContextStartEvent,
  ApplicationContextStopEvent
src/org.springframework.context
  ApplicationContextBeanRuntimeExceptionEvent,
  ApplicationContextProvider, ApplicationEvent, ILifecycle
src/org.springframework.test
  @Test
src/org.springframework.transaction
  AbstractTransaction, AbstractTransactionManager
```

### Additional (has different meanings rather than in Java):

```
src/javax (@Resource)
src/org.springframework.context (@Throwable, @ThrowableAsync, IThrowable)
src/org.springframework.context (JsonUrlApplicationContext)
src/org.springframework.context (IApplicationContextLoader)
src/org.springframework.test (@AsyncTest, @Spy, @SpyOnGet)
```

## Example (see src/test/packageDemo.ts and src/\_\_tests/demo.test.ts)

- Dependencies: reflect-metadata (no other dependencies).
- TS compile options: experimentalDecorators, emitDecoratorMetadata.

```
npm i
npm run test
```

Here is an example below wich contains:

- 2 contexts: ApplicationContext & ApplicationTestContext
- @Configuration to replace existing bean

```
import {
  Bean,
  Autowired,
  PostConstruct,
  PreDestroy,
  IApplicationContextAware,
  IApplicationContext,
  ApplicationEvent,
  EventListener,
  ApplicationContextStartEvent,
  AbstractApplicationContext,
  FactoryBean,
  Spy,
  Test,
  TWishedBeanOrFactory,
  AsyncTest,
  Disposable,
  TDisposer,
  Throwable,
  ApplicationContextBeanRuntimeExceptionEvent,
  ApplicationContextStopEvent,
  ThrowableAsync,
  Configuration,
  bean
} from "js-beans";

//
// Tokens
//

export const ApplicationContextToken = Symbol();
export const AbstractValueToken = Symbol();
export const ConcreteValueToken = Symbol();
export const Bean1Token = Symbol();
export const Bean2Token = Symbol();
export const Bean3Token = Symbol();
export const Bean1TestToken = Symbol();
export const ConfigurationToken = Symbol();
export const CustomConsolePrefixToken = Symbol();

//
// events.ts
//

export class CustomApplicationEvent extends ApplicationEvent {}

//
// bean1.ts
//  singleton - every call to BeanFactory.getBean()
//              will provide the same bean per context
//
@Bean(Bean1Token)
export class Bean1 {
  @Autowired(Bean2Token) bean2: Bean2;

  @PostConstruct
  protected construct() {}

  @PreDestroy
  protected destruct() {}

  //
  // Api
  //

  public getSomething() {
    return 0;
  }
}

//
// bean2.ts
//   prototype - every call to BeanFactory.getBean()
//               will provide new bean per context
//
@Bean(Bean2Token, { scope: "prototype" })
export class Bean2 implements IApplicationContextAware {
  @Autowired(ApplicationContextToken) context: IApplicationContext;
  @Autowired(AbstractValueToken) value: number;
  @Autowired(CustomConsolePrefixToken) prefix: string;

  @Disposable disposer: TDisposer = () =>
    console.log(`${this.prefix} some resource has disposed`);

  @PostConstruct
  public construct() {
    /* all dependencies ready */
    this.context.publishEvent(new CustomApplicationEvent());
    // All beans in current context and its parent contexts
    //   will able to handle this message using @EventListener.
    // See example below.
  }

  @PreDestroy
  public destruct() {
    /* close other non disposable resources */
  }

  //
  // Api
  //

  @Throwable()
  public throwError() {
    throw new Error();
    // current context will broadcast
    //   ApplicationContextBeanRuntimeExceptionEvent
    // requires ApplicationContextAware to be implemented
    // Reccomendations:
    //   create UserNotifier service to show all error to user
    //     from @Throwable functions
  }

  @ThrowableAsync()
  public async throwAsyncError() {
    throw new Error();
    // the same as throwError but in async code
  }

  //
  // Event listeners
  //

  @EventListener(ApplicationContextStartEvent as any)
  protected handleApplicationContextStartEvent(
    e: ApplicationContextStartEvent
  ) {
    // Application context started!
    // All beans acquired in context start() function are instantiated
    //   with their dependencies"
  }

  @EventListener(ApplicationContextStopEvent as any)
  protected handleApplicationContextStopEvent(e: ApplicationContextStopEvent) {
    // Application context stoped!
    // All beans destroyes and all disposables disposed
  }

  @EventListener(ApplicationContextBeanRuntimeExceptionEvent as any)
  protected handleApplicationContextBeanRuntimeExceptionEvent(
    e: ApplicationContextBeanRuntimeExceptionEvent
  ) {
    // Somewhere in this context or in child context bean throwed an error!
    // Show notification to user
    // const error: Error = e.exception; // raised error
    // const sourceContext = e.source; // context where error was raised
  }

  @EventListener(CustomApplicationEvent as any)
  protected handleCustomApplicationEvent(e: CustomApplicationEvent) {
    // your custom event handler
  }
}

//
// applicationContext.ts
//
export class ApplicationContext extends AbstractApplicationContext {
  public configure() {
    // map tokens before context bootstrapping
    super.configure(
      new Map<any, TWishedBeanOrFactory>([
        [AbstractValueToken, ConcreteValueToken],
        [ConcreteValueToken, FactoryBean.of(() => 0)]
      ])
    );
  }

  public start() {
    // bootstrap context

    // instantiate bean1 with it's dependencies
    this.getBean<Bean1>(Bean1Token);

    super.start();
  }
}

//
// applicationTestContext.ts
//
export class ApplicationTestContext extends AbstractApplicationContext {
  public configure() {
    super.configure(
      new Map<any, TWishedBeanOrFactory>([
        // map tokens before test context bootstrapping

        // replace original bean with test bean
        [Bean1Token, Bean1TestToken],
        // assign bean to token using factory wich calls every time
        //   when BeanFactory.getBean() called
        [ConcreteValueToken, FactoryBean.of(() => 0)],
        [CustomConsolePrefixToken, FactoryBean.of(() => `[CONSOLE PREFIX]:`)],
        // assign real bean to abstract token
        [AbstractValueToken, ConcreteValueToken]
      ])
    );
  }

  public start() {
    // bootstrap context

    // instantiate value using FactoryBean
    this.getBean(CustomConsolePrefixToken); // `[CONSOLE PREFIX]:`

    // instantiate configuration (no @beans created)
    this.getBean(ConfigurationToken);

    // instantiate value using @bean from @Configuration
    //   cause of configuration method consolePrefix() replaced the token
    this.getBean(CustomConsolePrefixToken); // `[CUSTOM CONSOLE PREFIX]:`

    // instantiate bean with it's dependencies
    this.getBean<Bean1>(Bean1Token);

    super.start();
  }
}

//
// Bean1Test.ts
//
@Bean(Bean1TestToken)
export class Bean1Test extends Bean1 {
  @Spy public getSomething() {
    /* usual jest spy */
    return super.getSomething();
  }

  @Test
  public test1() {
    expect(this.getSomething()).toBe(0);
    expect(this.getSomething).toBeCalled(); // check spy
  }

  @AsyncTest
  public async test2() {
    /* await operations */
  }
}

//
// Bean3.ts
//   singleton bean for all contexts
//
@Bean(Bean3Token, { scope: "global" })
export class Bean3Test extends Bean1 {}

//
// Configuration.ts
//
@Configuration(ConfigurationToken)
export class ApplicationConfiguration {
  @bean(CustomConsolePrefixToken)
  public consolePrefix() {
    return "[CUSTOM CONSOLE PREFIX]:";
  }
}

//
// ChildContext.ts
//
//   /*
//    * context inheritance
//    *   now BeanFactory.getBean() works as following:
//    *   1. search bean in current context, if found return it
//    *   2. search bean in parent context, if found return it,
//    *        if not in parent's parent and so on
//    *   3. if in parent tree bean not found instantiate it in child context
//    *        (if in child context abstract token is mapped to real)
//    *   4. if no suitable bean found and it is not required
//    *        (e.g. getBean() called with false as 2 argument)
//    *        then just return null, otherwise throw error
//    * usage:
//    */
//   const parentContext = new ApplicationContext();
//   parentContext.configure();
//   parentContext.start();
//   const childContext = new ChildContext()
//   childContext.configure();
//   childContext.setParent(parentContext); // !!!
//   childContext.start();
//
export class ChildContext extends AbstractApplicationContext {
  /* ... */
  /* here the same logic as in any other context */
}

//
// !!! main.ts
//   instantiate your application here
//
// const applicationContext = new ApplicationContext();
// ApplicationContextProvider.get().setApplicationContext(applicationContext);

//
// !!! Not beans files.ts
//   maybe you want to use IoC somewhere else
//
// const isRequired: boolean = false;
// const extraMapOnlyForSpecificCall = new Map<any, TWishedBeanOrFactory>([
//   /* remap existings tokens only for specific call */
//   [AbstractValueToken, FactoryBean.of(() => 1)]
// ])
// const bean1 = ApplicationContextProvider.get().getApplicationContext()
//   .getBean(Bean1Token, isRequired, extraMapOnlyForOneCall)

//
// !!! React files.ts
//
// const applicationContext = ApplicationContextProvider.get()
//   .getApplicationContext();
//
// class ReactComponent extends React.Component {
//
//   constructor() {
//      const bean1 = applicationContext.getBean(Bean1Token);
//   }
//
//   @Throwable(applicationContext)
//   handleClick() {
//     throw new Error("method not implemented");
//     // applicationContext will broadcast
//     //   ApplicationContextBeanRuntimeExceptionEvent
//   }
//
//   render() {
//     return (<Button onClick={this.handleClick} />);
//   }
//
// }
//
```

### Receipts

see src/**tests** to run receipt packages:

- src/tests/packagePlugins.ts - demonstrates how to use chaining of optional
  plugable beans in case you want to modify your bean beahaviour using Proxy.
- src/tests/package1.ts & src/package2.ts - demonstrates how to use
  two contexts and different scopes (prototype and so one).
- src/tests/packageDemo.ts - contains example from this readme.
- src/tests/packagePoc.ts - demonstrates how to use hierachical contexts.
- src/tests/packageFactoryBean.ts - demonstrates how to use beans resolvers.
- src/tests/packageTransactions.ts - demonstrates how to use transactions.
- src/tests/packageContext.ts - demonstrates basic IoC functionality.
- src/tests/packageContextLoader.ts - example how to load context from url.

### Limitations

- Currently injection available using @Autowire (setter) and @bean (method),
  there is no constructor injections.
- Currently there is no type cheking in runtime.
